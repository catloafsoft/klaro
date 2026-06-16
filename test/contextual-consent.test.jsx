import { describe, expect, it } from 'vitest';
import ConsentManager from '../src/consent-manager';
import { renderContextualConsentNotices } from '../src/lib';
import { TestStore } from '../src/stores';

const t = (key, values = {}) => {
    const path = Array.isArray(key) ? key.join('.') : key;
    const strings = {
        'contextualConsent.acceptAlways': 'Always',
        'contextualConsent.acceptOnce': 'Yes',
        'contextualConsent.description': `Do you want to load external content supplied by ${values.title}?`,
        'contextualConsent.modalLinkText': 'Consent Manager',
    };
    return strings[path] || path;
};

describe('contextual consent notices', () => {
    it('preserves iframe dimensions on generated placeholders', () => {
        const config = {
            services: [
                {
                    name: 'youtube',
                    purposes: ['marketing'],
                    contextualConsentOnly: true,
                },
            ],
        };
        const manager = new ConsentManager(config, new TestStore());
        document.body.innerHTML = '<iframe data-name="youtube" width="560" height="315"></iframe>';

        renderContextualConsentNotices(manager, t, 'en', config);

        const placeholder = document.querySelector('[data-type="placeholder"]');
        expect(placeholder?.style.width).toBe('560px');
        expect(placeholder?.style.maxWidth).toBe('100%');
        expect(placeholder?.style.height).toBe('315px');
    });

    it('does not collapse placeholders for elements without intrinsic dimensions', () => {
        const config = {
            services: [
                {
                    name: 'twitter',
                    purposes: ['marketing'],
                    contextualConsentOnly: true,
                },
            ],
        };
        const manager = new ConsentManager(config, new TestStore());
        document.body.innerHTML = '<div data-name="twitter"><a href="https://example.com">Follow</a></div>';

        renderContextualConsentNotices(manager, t, 'en', config);

        const placeholder = document.querySelector('[data-type="placeholder"]');
        expect(placeholder?.style.width).toBe('100%');
        expect(placeholder?.style.minHeight).toBe('140px');
    });
});
