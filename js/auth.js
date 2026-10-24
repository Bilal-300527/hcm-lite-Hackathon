function switchAuthTab(type) {
    document.getElementById('tab-login').classList.toggle('active', type === 'login');
    document.getElementById('tab-setup').classList.toggle('active', type === 'setup');
    document.getElementById('login-form').classList.toggle('hidden', type !== 'login');
    document.getElementById('setup-form').classList.toggle('hidden', type !== 'setup');
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    const users = Storage.getUsers();
    const user = users.find(u => u.email === email && u.pass === pass && u.role === role);

    if (user) {
        Storage.setSession(user);
        if (role === 'admin' || role === 'hr') window.location.href = 'pages/admin.html';
        else window.location.href = 'pages/employee.html';
    } else {
        alert('Invalid Email, Password or Role!');
    }
});

document.getElementById('setup-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const compName = document.getElementById('setup-company').value;
    const adminName = document.getElementById('setup-admin-name').value;
    const adminEmail = document.getElementById('setup-admin-email').value;
    const adminPass = document.getElementById('setup-admin-pass').value;

    Storage.setCompany({ name: compName, startTime: '09:00', grace: 15, quota: 18 });
    const users = Storage.getUsers();
    const newAdmin = { id: Date.now(), name: adminName, email: adminEmail, pass: adminPass, role: 'admin', dept: 'Executive', salary: 12000 };
    users.push(newAdmin);
    Storage.setUsers(users);
    Storage.setSession(newAdmin);
    window.location.href = 'pages/admin.html';
});
