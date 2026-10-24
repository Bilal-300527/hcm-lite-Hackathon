document.addEventListener('DOMContentLoaded', () => {
    const session = Storage.getSession();
    if (!session || (session.role !== 'admin' && session.role !== 'hr')) {
        window.location.href = '../index.html';
        return;
    }

    const nameEl = document.getElementById('user-display-name');
    if (nameEl) nameEl.textContent = session.name;
    const dateEl = document.getElementById('current-date');
    if (dateEl) dateEl.textContent = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const users = Storage.getUsers();
    const hrs = users.filter(u => u.role === 'hr');
    const emps = users.filter(u => u.role === 'employee');

    const hrCountEl = document.getElementById('total-hr-count');
    if (hrCountEl) hrCountEl.textContent = hrs.length;
    const empCountEl = document.getElementById('total-emp-count');
    if (empCountEl) empCountEl.textContent = emps.length;

    const tbody = document.getElementById('hr-table-body');
    if (tbody) {
        tbody.innerHTML = hrs.map(hr => `
            <tr>
                <td><strong>${hr.name}</strong></td>
                <td>${hr.dept}</td>
                <td>${emps.filter(e => e.dept === hr.dept).length} Staff Members</td>
                <td><span style="color: var(--success); font-weight:600;">Active HR</span></td>
            </tr>
        `).join('') || '<tr><td colspan="4">No HR Managers assigned yet.</td></tr>';
    }
});
