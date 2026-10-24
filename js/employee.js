document.addEventListener('DOMContentLoaded', () => {
    const session = Storage.getSession();
    if (!session) { window.location.href = '../index.html'; return; }

    const nameEl = document.getElementById('emp-portal-name');
    if (nameEl) nameEl.textContent = session.name;
    const deptEl = document.getElementById('emp-portal-dept');
    if (deptEl) deptEl.textContent = session.dept;

    const checkinBtn = document.getElementById('checkin-btn');
    if (checkinBtn) {
        checkinBtn.addEventListener('click', () => {
            document.getElementById('today-status').textContent = 'Present (09:02 AM)';
            alert('Face check-in successful!');
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            document.getElementById('today-status').textContent = 'Checked Out';
        });
    }
});
