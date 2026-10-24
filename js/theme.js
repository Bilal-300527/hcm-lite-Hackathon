document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('hcm_theme') || 'light';
    applyTheme(currentTheme);

    const toggleBtns = document.querySelectorAll('.theme-toggle-btn, #theme-toggle-btn');
    toggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const activeTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('hcm_theme', activeTheme);
            applyTheme(activeTheme);
        });
    });
});

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const icons = document.querySelectorAll('.theme-toggle-btn i, #theme-toggle-btn i');
    const texts = document.querySelectorAll('.theme-toggle-btn span');

    icons.forEach(icon => {
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    });

    texts.forEach(text => {
        text.textContent = theme === 'dark' ? 'Light Mode' : 'Dark Mode';
    });
}
