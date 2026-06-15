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
});
