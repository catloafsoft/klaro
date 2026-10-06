import api from './dist/klaro.js';

export const {
    addEventListener,
    defaultConfig,
    defaultTranslations,
    getConfigTranslations,
    getElement,
    getElementID,
    getManager,
    language,
    render,
    renderContextualConsentNotices,
    resetManagers,
    setup,
    show,
    updateConfig,
    validateConfig,
    version,
} = api;
export default api;
