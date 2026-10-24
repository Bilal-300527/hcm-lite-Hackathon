const settingsForm = document.getElementById('settings-form');
if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Storage.setCompany({
            name: 'Demo Tech',
            startTime: document.getElementById('start-time').value,
            grace: document.getElementById('grace-mins').value,
            quota: document.getElementById('quota').value
        });
        alert('Company policy updated!');
    });
}
