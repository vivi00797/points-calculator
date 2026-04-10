// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Constants
const THEME_KEY = 'blog_theme_preference';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

// Functions
function setTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
}

function getSavedTheme() {
    return localStorage.getItem(THEME_KEY);
}

function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? DARK_THEME : LIGHT_THEME;
}

function initTheme() {
    const savedTheme = getSavedTheme();
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme(getSystemTheme());
    }
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;
    setTheme(newTheme);
}

// Event Listeners
themeToggle.addEventListener('click', toggleTheme);

// Initialize
initTheme();
