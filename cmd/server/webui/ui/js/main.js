import { router } from './router.js';
import { state } from './state.js';
import { dashboard } from './components/dashboard.js';
import { endpoints } from './components/endpoints.js';
import { stats } from './components/stats.js';
import { testing } from './components/testing.js';
import { t, getLanguage, setLanguage, getAvailableLanguages } from './i18n/index.js';

// Export t function for global use
window.t = t;

// Initialize language switcher
function initLanguage() {
    const savedLang = localStorage.getItem('ccNexus_language') || 'en';
    setLanguage(savedLang);
    updateNavTexts();

    // Add language toggle button
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (sidebarFooter) {
        const langToggle = document.createElement('button');
        langToggle.id = 'lang-toggle';
        langToggle.className = 'btn-icon';
        langToggle.title = 'Switch Language / 切换语言';
        langToggle.innerHTML = `<span class="icon">${savedLang === 'zh-CN' ? '中' : 'EN'}</span>`;
        langToggle.style.marginRight = '8px';
        sidebarFooter.insertBefore(langToggle, sidebarFooter.firstChild);

        langToggle.addEventListener('click', () => {
            const currentLang = getLanguage();
            const newLang = currentLang === 'en' ? 'zh-CN' : 'en';
            setLanguage(newLang);
            langToggle.querySelector('.icon').textContent = newLang === 'zh-CN' ? '中' : 'EN';
            updateNavTexts();
            // Re-render current view
            const currentView = state.get('currentView') || 'dashboard';
            router.navigate(currentView);
        });
    }
}

// Update navigation texts
function updateNavTexts() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const view = link.dataset.view;
        const textSpan = link.querySelector('span:last-child');
        if (textSpan && view) {
            textSpan.textContent = t(`nav.${view}`);
        }
    });

    // Update subtitle
    const subtitle = document.querySelector('.sidebar-header .subtitle');
    if (subtitle) {
        subtitle.textContent = 'AI Proxy Admin';
    }
}

// Initialize theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.querySelector('.icon').textContent = isDark ? '☀️' : '🌙';
    });

    // Set initial icon
    themeToggle.querySelector('.icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Initialize real-time updates
function initRealtime() {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            if (data.type === 'stats') {
                state.update('stats', data.stats);
                state.update('currentEndpoint', data.currentEndpoint);

                // Update dashboard if it's the current view
                if (state.get('currentView') === 'dashboard') {
                    // Dashboard will handle its own updates via state subscription
                }
            }
        } catch (error) {
            console.error('Failed to parse SSE event:', error);
        }
    };

    eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        // Attempt to reconnect after 5 seconds
        setTimeout(() => {
            if (eventSource.readyState === EventSource.CLOSED) {
                initRealtime();
            }
        }, 5000);
    };
}

// Initialize application
function init() {
    // Register routes
    router.register('dashboard', dashboard);
    router.register('endpoints', endpoints);
    router.register('stats', stats);
    router.register('testing', testing);

    // Initialize theme
    initTheme();

    // Initialize language
    initLanguage();
    router.init();

    // Initialize real-time updates
    initRealtime();

    console.log('ccNexus Admin initialized');
}

// Start application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
