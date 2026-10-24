/* ==========================================================
   ui.js  —  shared layout (sidebar + top bar), toasts, modals,
             form error helpers, badges, announcements list
   Needs: storage.js, auth.js
   ========================================================== */

/* ---------- Theme (dark mode, saved in hcm_theme) ---------- */

function applyTheme() {
  const theme = getData(KEYS.theme, "light");
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}

function toggleTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  setData(KEYS.theme, isDark ? "light" : "dark");
  applyTheme();
  updateThemeButton();
}

function updateThemeButton() {
  const btn = document.getElementById("theme-btn");
  if (!btn) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? "☀️" : "🌙";
  btn.title = isDark ? "Switch to light mode" : "Switch to dark mode";
}

/* ---------- Toasts ---------- */

function showToast(message, type) {
  let box = document.getElementById("toast-container");
  if (!box) {
    box = document.createElement("div");
    box.id = "toast-container";
    document.body.appendChild(box);
  }
  const toast = document.createElement("div");
  toast.className = "toast toast-" + (type || "info");
  toast.setAttribute("role", "status");
  toast.textContent = message;
  box.appendChild(toast);
  setTimeout(function () {
    toast.classList.add("hide");
    setTimeout(function () { toast.remove(); }, 300);
  }, 3500);
}

/* ---------- Modal ---------- */

function openModal(title, bodyHtml) {
  closeModal();
  let root = document.getElementById("modal-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "modal-root";
    document.body.appendChild(root);
  }
  root.innerHTML =
    '<div class="modal-backdrop">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">' +
        '<div class="modal-head"><h3 id="modal-title">' + escapeHtml(title) + '</h3>' +
        '<button type="button" class="icon-btn" data-close aria-label="Close">✕</button></div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
      '</div>' +
    '</div>';
  document.body.classList.add("modal-open");

  const backdrop = root.querySelector(".modal-backdrop");
  backdrop.addEventListener("click", function (e) {
    if (e.target === backdrop || e.target.closest("[data-close]")) closeModal();
  });
  const firstInput = root.querySelector("input, textarea, select");
  if (firstInput) firstInput.focus();
  return root.querySelector(".modal");
}

function closeModal() {
  const root = document.getElementById("modal-root");
  if (root) root.innerHTML = "";
  document.body.classList.remove("modal-open");
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeModal();
});

// "Are you sure?" dialog
function confirmDialog(title, message, confirmLabel, onConfirm) {
  const modal = openModal(title,
    '<p class="confirm-text">' + escapeHtml(message) + '</p>' +
    '<div class="modal-actions">' +
      '<button type="button" class="btn btn-outline" data-close>Cancel</button>' +
      '<button type="button" class="btn btn-danger" id="confirm-yes">' + escapeHtml(confirmLabel) + '</button>' +
    '</div>');
  modal.querySelector("#confirm-yes").addEventListener("click", function () {
    closeModal();
    onConfirm();
  });
}

/* ---------- Form error helpers (error text sits next to the field) ----------
   Markup for every field:
   <div class="field"><label>..</label><input name="x"><small class="error"></small></div>  */

function clearFormErrors(form) {
  form.querySelectorAll(".error").forEach(function (el) { el.textContent = ""; });
  form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
}

function showFormErrors(form, errors) {
  let firstInput = null;
  Object.keys(errors).forEach(function (name) {
    const input = form.querySelector('[name="' + name + '"]');
    if (!input) return;
    const field = input.closest(".field");
    const errorEl = field ? field.querySelector(".error") : null;
    if (errorEl) errorEl.textContent = errors[name];
    input.classList.add("invalid");
    if (!firstInput) firstInput = input;
  });
  if (firstInput) firstInput.focus();
}

/* ---------- Status badges ---------- */

const STATUS_INFO = {
  "present": ["success", "Present"],
  "late": ["warning", "Late"],
  "half-day": ["amber", "Half Day"],
  "absent": ["danger", "Absent"],
  "leave": ["info", "On Leave"],
  "pending": ["info", "Pending"],
  "approved": ["success", "Approved"],
  "rejected": ["danger", "Rejected"],
  "off": ["muted", "Weekly off"],
  "future": ["muted", "Upcoming"],
  "notjoined": ["muted", "Not joined"]
};

function statusBadge(status, labelOverride) {
  const info = STATUS_INFO[status] || ["muted", status];
  return '<span class="badge badge-' + info[0] + '">' + escapeHtml(labelOverride || info[1]) + '</span>';
}

/* ---------- Announcements list (Admin can delete, Employee read-only) ---------- */

function renderAnnouncements(containerId, canDelete) {
  const box = document.getElementById(containerId);
  if (!box) return;
  const list = getAnnouncements().slice().sort(function (a, b) {
    return (b.createdAt || 0) - (a.createdAt || 0); // newest first
  });

  if (list.length === 0) {
    box.innerHTML = '<div class="empty">No announcements yet.</div>';
    return;
  }

  box.innerHTML = list.map(function (a) {
    return '<article class="announcement">' +
      '<div class="announcement-head"><strong>' + escapeHtml(a.title) + '</strong>' +
      (canDelete ? '<button type="button" class="icon-btn small" data-delete-announcement="' + escapeHtml(a.id) + '" aria-label="Delete announcement" title="Delete">🗑️</button>' : '') +
      '</div>' +
      '<p>' + escapeHtml(a.message).replace(/\n/g, "<br>") + '</p>' +
      '<small class="muted">' + escapeHtml(formatDateNice(a.date)) + '</small>' +
      '</article>';
  }).join("");

  if (canDelete) {
    box.onclick = function (e) {
      const btn = e.target.closest("[data-delete-announcement]");
      if (!btn) return;
      const id = btn.getAttribute("data-delete-announcement");
      confirmDialog("Delete announcement", "Do you want to delete this announcement?", "Delete", function () {
        saveAnnouncements(getAnnouncements().filter(function (a) { return a.id !== id; }));
        renderAnnouncements(containerId, true);
        showToast("Announcement deleted.", "success");
      });
    };
  }
}

/* ---------- Shared page shell: guard + sidebar + top bar ---------- */

// Call this FIRST on every inner page. Returns the user, or null when the
// guard has redirected (then the page must stop running its own code).
function initShell() {
  applyTheme();
  const role = document.body.dataset.role || "any";
  const user = requireRole(role);
  if (!user) return null;

  document.body.classList.remove("auth-pending");
  buildSidebar(user);
  buildTopbar(user);
  setupMobileMenu();
  updateThemeButton();
  return user;
}

function buildSidebar(user) {
  const root = getRoot();
  const page = document.body.dataset.page;
  const company = getCompany();

  const adminLinks = [
    { page: "admin", href: "pages/admin.html", icon: "📊", label: "Dashboard" },
    { page: "employees", href: "pages/employees.html", icon: "👥", label: "Employees" },
    { page: "leaves", href: "pages/leaves.html", icon: "🗓️", label: "Leave Requests" },
    { page: "settings", href: "pages/settings.html", icon: "⚙️", label: "Settings" },
    { page: "payslip", href: "pages/payslip.html", icon: "💵", label: "Payslips" }
  ];
  const employeeLinks = [
    { page: "employee", href: "pages/employee.html", icon: "📊", label: "Dashboard" },
    { page: "payslip", href: "pages/payslip.html", icon: "💵", label: "Payslip" }
  ];
  const links = user.role === "admin" ? adminLinks : employeeLinks;

  document.getElementById("sidebar").innerHTML =
    '<div class="brand"><span class="brand-logo">H</span>' +
    '<div class="brand-text"><strong>HCM Lite</strong><small>' + escapeHtml(company.name) + '</small></div></div>' +
    '<nav class="nav" aria-label="Main menu">' +
    links.map(function (l) {
      return '<a class="nav-link' + (l.page === page ? ' active' : '') + '" href="' + root + l.href + '">' +
        '<span class="nav-icon" aria-hidden="true">' + l.icon + '</span><span>' + l.label + '</span></a>';
    }).join("") +
    '</nav>' +
    '<div class="sidebar-foot">Saylani Hackathon<br>Beginner Track</div>';
}

function buildTopbar(user) {
  const title = document.body.dataset.title || "HCM Lite";
  const initial = (user.name || "?").trim().charAt(0).toUpperCase();

  document.getElementById("topbar").innerHTML =
    '<button type="button" class="icon-btn menu-btn" id="menu-btn" aria-label="Open menu">☰</button>' +
    '<h2 class="topbar-title">' + escapeHtml(title) + '</h2>' +
    '<div class="topbar-right">' +
      '<button type="button" class="icon-btn" id="theme-btn" aria-label="Toggle dark mode">🌙</button>' +
      '<div class="user-chip"><span class="avatar">' + escapeHtml(initial) + '</span>' +
      '<div class="user-meta"><strong>' + escapeHtml(user.name) + '</strong><small>' + (user.role === "admin" ? "Admin" : "Employee") + '</small></div></div>' +
      '<button type="button" class="btn btn-ghost btn-sm" id="pw-btn">🔑<span class="hide-sm"> Change password</span></button>' +
      '<button type="button" class="btn btn-outline btn-sm" id="logout-btn">Logout</button>' +
    '</div>';

  document.getElementById("logout-btn").addEventListener("click", logout);
  document.getElementById("theme-btn").addEventListener("click", toggleTheme);
  document.getElementById("pw-btn").addEventListener("click", function () { openPasswordModal(user); });
}

function setupMobileMenu() {
  const menuBtn = document.getElementById("menu-btn");
  const overlay = document.getElementById("sidebar-overlay");
  function close() { document.body.classList.remove("sidebar-open"); }
  menuBtn.addEventListener("click", function () { document.body.classList.toggle("sidebar-open"); });
  if (overlay) overlay.addEventListener("click", close);
  document.getElementById("sidebar").addEventListener("click", function (e) {
    if (e.target.closest("a")) close();
  });
}

/* ---------- Change password modal ---------- */

function openPasswordModal(user) {
  const modal = openModal("Change password",
    '<form id="pw-form" novalidate>' +
      fieldHtml("oldPassword", "Current password", "password", "current-password") +
      fieldHtml("newPassword", "New password (min 6 characters)", "password", "new-password") +
      fieldHtml("confirmPassword", "Confirm new password", "password", "new-password") +
      '<div class="modal-actions">' +
        '<button type="button" class="btn btn-outline" data-close>Cancel</button>' +
        '<button type="submit" class="btn btn-primary">Update password</button>' +
      '</div>' +
    '</form>');

  const form = modal.querySelector("#pw-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearFormErrors(form);
    const oldPassword = form.elements.oldPassword.value;
    const newPassword = form.elements.newPassword.value;
    const confirmPassword = form.elements.confirmPassword.value;

    const errors = {};
    if (!oldPassword) errors.oldPassword = "Enter your current password.";
    else if (oldPassword !== user.password && !changePasswordCheck(user.id, oldPassword)) errors.oldPassword = "Current password is wrong.";
    if (!newPassword) errors.newPassword = "Enter a new password.";
    else if (newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters.";
    if (!confirmPassword) errors.confirmPassword = "Please confirm the new password.";
    else if (confirmPassword !== newPassword) errors.confirmPassword = "Passwords do not match.";
    if (Object.keys(errors).length > 0) { showFormErrors(form, errors); return; }

    if (changePassword(user.id, oldPassword, newPassword)) {
      closeModal();
      showToast("Password changed successfully.", "success");
    } else {
      showFormErrors(form, { oldPassword: "Current password is wrong." });
    }
  });
}

// Checks the stored password (the `user` object may be a little stale)
function changePasswordCheck(userId, password) {
  const fresh = getUserById(userId);
  return !!fresh && fresh.password === password;
}

/* Builds the markup of one form field (label + input + error text) */
function fieldHtml(name, label, type, autocomplete) {
  return '<div class="field">' +
    '<label for="f-' + name + '">' + escapeHtml(label) + '</label>' +
    '<input id="f-' + name + '" name="' + name + '" type="' + type + '"' +
    (autocomplete ? ' autocomplete="' + autocomplete + '"' : '') + '>' +
    '<small class="error" aria-live="polite"></small></div>';
}
