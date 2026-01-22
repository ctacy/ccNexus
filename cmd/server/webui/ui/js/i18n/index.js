// i18n module for Web UI
import en from './en.js';
import zhCN from './zh-CN.js';

const translations = {
    'en': en,
    'zh-CN': zhCN
};

let currentLanguage = localStorage.getItem('ccNexus_language') || 'en';

export function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('ccNexus_language', lang);
        // Dispatch event for components to update
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
    }
}

export function getLanguage() {
    return currentLanguage;
}

export function t(key) {
    const keys = key.split('.');
    let value = translations[currentLanguage];

    for (const k of keys) {
        if (value && typeof value === 'object') {
            value = value[k];
        } else {
            return key; // Return key if translation not found
        }
    }

    return value || key;
}

// Get available languages
export function getAvailableLanguages() {
    return [
        { code: 'en', name: 'English' },
        { code: 'zh-CN', name: '简体中文' }
    ];
}
