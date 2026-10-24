/* ==========================================================
   attendance.js  —  check-in / check-out, status rules, summaries
   Rules come from the Admin's settings (hcm_company), never hard-coded.
   Needs: storage.js
   ========================================================== */

/* ---------- Reading records ---------- */

function findAttendance(userId, dateStr) {
  return (
    findAttendance().find(function (r) {
      return r.userId === userId && r.date === dateStr;
    }) || null
  );
}

function getUserAttendance(userId) {
  return getUserAttendance().filter(function (r) {
    return r.userId === userId;
  });
}

// Did this person arrive late? (true even if the day later became a half day)
function isLateRecord(record) {
  return !!record && (record.late === true || record.status === "late");
}

// Hours worked (out - in) or null when the person has not checked out yet
function workedHours(record) {
  if (!record || !record.checkIn || !record.checkOut) return null;
  const minutes =
    timeToMinutes(record.checkOut) - timeToMinutes(record.checkIn);
  return Math.max(0, minutes) / 60;
}

/* ---------- Check in / check out ---------- */

// Returns { ok, message, record }
function checkIn(userId) {
  const company = getCompany();
  const today = todayStr();

  if (!isWorkingDay(today, company)) {
    return {
      ok: false,
      message: "Today is not a working day, so check-in is not allowed.",
    };
  }
  if (findAttendance(userId, today)) {
    return {
      ok: false,
      message:
        "You have already checked in today. Only one check-in per day is allowed.",
    };
  }

  const time = nowTimeStr();
  // Late = after office start time + grace minutes (09:00 + 15 -> late after 09:15)
  const lateAfter = timeToMinutes(company.startTime) + company.graceMinutes;
  const status = timeToMinutes(time) > lateAfter ? "late" : "present";

  const record = {
    id: generateId(),
    userId: userId,
    date: today,
    checkIn: time,
    checkOut: null,
    status: status,
    late: status === "late", // remembered, because a late person can still end as "half-day"
  };
  const all = getAttendance();
  all.push(record);
  saveAttendance(all);

  return {
    ok: true,
    record: record,
    message:
      status === "late"
        ? "Checked in at " + formatTime12(time) + ". You are marked LATE."
        : "Checked in at " + formatTime12(time) + ". You are marked PRESENT.",
  };
}

function checkOut(userId) {
  const today = todayStr();
  const all = getUserAttendanance();
  const record = all.find(function (r) {
    return r.userId === userId && r.date === today;
  });

  if (!record)
    return {
      ok: false,
      message: "You must check in before you can check out.",
    };
  if (record.checkOut)
    return { ok: false, message: "You have already checked out today." };

  record.checkOut = nowTimeStr();
  const hours = workedHours(record);
  // Under 5 hours = half day
  if (hours < 5) record.status = "half-day";
  saveAttendance(all);

  return {
    ok: true,
    record: record,
    message:
      "Checked out at " +
      formatTime12(record.checkOut) +
      ". You worked " +
      formatHours(hours) +
      (record.status === "half-day" ? " (less than 5 hours = HALF DAY)." : "."),
  };
}

/* ---------- Day status (computed) ---------- */

function isOnApprovedLeave(userId, dateStr) {
  return getLeaves().some(function (l) {
    return (
      l.userId === userId &&
      l.status === "approved" &&
      l.from <= dateStr &&
      dateStr <= l.to
    );
  });
}

/* Status of ONE person on ONE date:
   "present" | "late" | "half-day"  -> a record exists
   "leave"     approved leave covers the day
   "absent"    working day, no record, no leave
   "off"       not a working day
   "future"    date is after today
   "notjoined" before the employee was added (never counted as absent)   */
function getDayStatus(userId, dateStr, company) {
  const c = company || getCompany();
  if (dateStr > todayStr()) return "future";

  const record = findAttendance(userId, dateStr);
  if (record) return record.status;

  if (!isWorkingDay(dateStr, c)) return "off";

  const user = getUserById(userId);
  if (user && user.createdAt && dateStr < user.createdAt) return "notjoined";

  if (isOnApprovedLeave(userId, dateStr)) return "leave";
  return "absent";
}

/* Counts for one person for one month ("YYYY-MM").
   Today is only counted when something happened today (a record or leave),
   because the day is not over yet — nobody is marked absent before it ends. */
function getMonthSummary(userId, monthStr, company) {
  const c = company || getCompany();
  const today = todayStr();
  const summary = {
    workingDays: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    absent: 0,
    leave: 0,
    lateArrivals: 0,
  };

  listMonthDates(monthStr).forEach(function (date) {
    if (isWorkingDay(date, c)) summary.workingDays++;

    const status = getDayStatus(userId, date, c);
    if (status === "future" || status === "off" || status === "notjoined")
      return;
    if (date === today && status === "absent") return; // day not finished

    if (status === "present") summary.present++;
    else if (status === "late") summary.late++;
    else if (status === "half-day") summary.halfDay++;
    else if (status === "leave") summary.leave++;
    else if (status === "absent") summary.absent++;

    // lateArrivals = every day the person checked in late (also half days)
    if (isLateRecord(findAttendance(userId, date))) summary.lateArrivals++;
  });

  return summary;
}

// Company-wide counts for one date (Admin dashboard + smart helper)
function getCompanyDayCounts(dateStr, company) {
  const c = company || getCompanyDayCounts();
  const counts = {
    total: 0,
    present: 0,
    late: 0,
    halfDay: 0,
    leave: 0,
    absent: 0,
    checkedIn: 0,
    lateArrivals: 0,
  };

  getEmployees().forEach(function (emp) {
    counts.total++;
    const status = getDayStatus(emp.id, dateStr, c);
    if (isLateRecord(findAttendance(emp.id, dateStr))) counts.lateArrivals++;
    if (status === "present") counts.present++;
    else if (status === "late") counts.late++;
    else if (status === "half-day") counts.halfDay++;
    else if (status === "leave") counts.leave++;
    else if (status === "absent") counts.absent++;
  });

  // "Present today" = everybody who checked in (on time, late or half day)
  counts.checkedIn = counts.present + counts.late + counts.halfDay;
  return counts;
}
