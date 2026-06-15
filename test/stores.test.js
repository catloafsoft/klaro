import { describe, expect, it, vi } from 'vitest';
import { LocalStorageStore } from '../src/stores';

describe('StorageStore', () => {
    it('does not throw when browser storage is unavailable', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const original = window.localStorage;
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: {
                getItem: () => { throw new Error('blocked'); },
                setItem: () => { throw new Error('blocked'); },
                removeItem: () => { throw new Error('blocked'); },
            },
        });

        const store = new LocalStorageStore({ storageName: 'klaro' });

        expect(store.get()).toBe(null);
        expect(() => store.set('value')).not.toThrow();
        expect(() => store.delete()).not.toThrow();
        expect(warn).toHaveBeenCalled();

        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: original,
        });
    });
});
