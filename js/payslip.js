document.addEventListener('DOMContentLoaded', () => {
    const session = Storage.getSession();
    if (session) {
        const nameEl = document.getElementById('slip-name');
        if (nameEl) nameEl.textContent = session.name;
        const deptEl = document.getElementById('slip-dept');
        if (deptEl) deptEl.textContent = session.dept;
        const baseEl = document.getElementById('slip-base');
        if (baseEl) baseEl.textContent = session.salary || 4000;
        const deductEl = document.getElementById('slip-deduct');
        if (deductEl) deductEl.textContent = '0';
        const netEl = document.getElementById('slip-net');
        if (netEl) netEl.textContent = session.salary || 4000;
    }
});
