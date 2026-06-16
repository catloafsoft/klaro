import { describe, expect, it, vi } from 'vitest';
import ConsentManager from '../src/consent-manager';
import { TestStore } from '../src/stores';

const baseConfig = (overrides = {}) => ({
    storageMethod: 'test',
    services: [
        { name: 'analytics', purposes: ['analytics'] },
        { name: 'required', purposes: ['functional'], required: true },
    ],
    ...overrides,
});

describe('ConsentManager', () => {
    it('recovers from malformed stored consent data', () => {
        const store = new TestStore();
        store.set('%7Bbad-json');
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const manager = new ConsentManager(baseConfig(), store);

        expect(manager.getConsent('analytics')).toBe(false);
        expect(manager.getConsent('required')).toBe(true);
        expect(manager.confirmed).toBe(false);
        expect(manager.changed).toBe(true);
        expect(store.get()).toBe(null);
        expect(warn).toHaveBeenCalled();
    });

    it('respects Global Privacy Control when configured', () => {
        Object.defineProperty(navigator, 'globalPrivacyControl', {
            configurable: true,
            value: true,
        });

        const manager = new ConsentManager(baseConfig({
            default: true,
            respectGlobalPrivacyControl: true,
        }), new TestStore());

        expect(manager.getConsent('analytics')).toBe(false);
        expect(manager.getConsent('required')).toBe(true);
    });

    it('reports changed consents after saving', () => {
        const manager = new ConsentManager(baseConfig(), new TestStore());
        const watcher = { update: vi.fn() };
        manager.watch(watcher);

        manager.updateConsent('analytics', true);
        manager.saveConsents('save');

        expect(manager.confirmed).toBe(true);
        expect(watcher.update).toHaveBeenCalledWith(
            manager,
            'saveConsents',
            expect.objectContaining({
                changes: { analytics: true },
                type: 'save',
            })
        );
    });

    it('falls back when cookie patterns contain invalid regex syntax', () => {
        document.cookie = 'bad[pattern=value; path=/';
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const manager = new ConsentManager(baseConfig({
            services: [
                { name: 'analytics', purposes: ['analytics'], cookies: ['^bad[pattern$'] },
            ],
        }), new TestStore());

        expect(() => manager.updateServiceStorage(manager.config.services[0], false)).not.toThrow();
        expect(warn).toHaveBeenCalled();
    });

    it('copies iframe inline styles without parsing declarations manually', () => {
        document.body.innerHTML = '<iframe data-name="video" data-src="https://example.test/embed" style="width: 100px; height: 50px; background-image: url(https://example.test/a:b.png);"></iframe>';
        const manager = new ConsentManager(baseConfig({
            services: [
                { name: 'video', purposes: ['marketing'] },
            ],
        }), new TestStore());

        manager.updateConsent('video', true);
        manager.saveAndApplyConsents('accept');

        const iframe = document.querySelector('iframe');
        expect(iframe.style.width).toBe('100px');
        expect(iframe.style.height).toBe('50px');
        expect(iframe.style.backgroundImage).toContain('https://example.test/a:b.png');
    });
});
