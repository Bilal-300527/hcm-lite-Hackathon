const Storage = {
    getCompany: () => JSON.parse(localStorage.getItem('hcm_company')) || { name: 'Demo Tech', startTime: '09:00', grace: 15, quota: 18 },
    setCompany: (data) => localStorage.setItem('hcm_company', JSON.stringify(data)),
    
    getUsers: () => JSON.parse(localStorage.getItem('hcm_users')) || [
        { id: 1, name: 'Super Admin', email: 'admin@company.com', pass: '123456', role: 'admin', dept: 'Executive', salary: 10000 },
        { id: 2, name: 'Sarah HR', email: 'hr@company.com', pass: '123456', role: 'hr', dept: 'HR & People', salary: 6000 },
        { id: 3, name: 'Ali Khan', email: 'ali@company.com', pass: '123456', role: 'employee', dept: 'Engineering', salary: 4000 }
    ],
    setUsers: (users) => localStorage.setItem('hcm_users', JSON.stringify(users)),

    getSession: () => JSON.parse(localStorage.getItem('hcm_session')),
    setSession: (session) => localStorage.setItem('hcm_session', JSON.stringify(session)),

    getLeaves: () => JSON.parse(localStorage.getItem('hcm_leaves')) || [],
    setLeaves: (leaves) => localStorage.setItem('hcm_leaves', JSON.stringify(leaves)),

    getAttendance: () => JSON.parse(localStorage.getItem('hcm_attendance')) || [],
    setAttendance: (records) => localStorage.setItem('hcm_attendance', JSON.stringify(records))
};
