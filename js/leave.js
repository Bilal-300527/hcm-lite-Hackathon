document.addEventListener('DOMContentLoaded', () => {
    const leaves = Storage.getLeaves();
    const tbody = document.getElementById('leave-requests-body');
    if (tbody) {
        tbody.innerHTML = leaves.length ? leaves.map(l => `
            <tr>
                <td>Applicant #${l.empId}</td>
                <td>Employee</td>
                <td>${l.from} to ${l.to}</td>
                <td>${l.reason}</td>
                <td>${l.status}</td>
                <td><button class="btn btn-success">Approve</button></td>
            </tr>
        `).join('') : '<tr><td colspan="6">No leave applications pending.</td></tr>';
    }
});
