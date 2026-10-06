import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import packageJson from '../package.json';

const require = createRequire(import.meta.url);

describe('package exports', () => {
    it('keeps legacy bundles and modern subpath exports addressable', () => {
        for (const name of ['klaro', 'no-css', 'cm', 'translations']) {
            const modern = name === 'klaro' ? 'klaro' : `klaro/${name}`;
            const bundle = name === 'no-css' ? 'klaro-no-css' : name;
            expect(require.resolve(`klaro/dist/${bundle}`)).toBe(require.resolve(modern));
            expect(require.resolve(`klaro/dist/${bundle}.js`)).toBe(require.resolve(modern));
        }
        expect(readFileSync(require.resolve('klaro/klaro.css'), 'utf8')).toContain('.klaro');
    });

    it.each(['%', '%E0%A4%A'])('handles a malformed page fragment: %s', (fragment) => {
        const dom = new JSDOM('<!doctype html><html><body></body></html>', {
            url: `https://example.test/#${fragment}`,
            runScripts: 'outside-only',
        });
        try {
            runInContext(readFileSync(require.resolve('klaro'), 'utf8'), dom.getInternalVMContext());
            dom.window.klaro.setup({ services: [], noAutoLoad: true, storageMethod: 'test' });
            expect(dom.window.klaro.getManager().config.services).toHaveLength(0);
        } finally {
            dom.window.close();
        }
    });

    it.each(['klaro.js', 'klaro-no-css.js', 'klaro-no-translations.js', 'klaro-no-translations-no-css.js'])(
        '%s exposes the browser API and can open consent settings', async (bundle) => {
            const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
                url: 'https://example.test/',
                runScripts: 'outside-only',
            });
            try {
                runInContext(readFileSync(require.resolve(`klaro/dist/${bundle}`), 'utf8'), dom.getInternalVMContext());
                const api = dom.window.klaro;
                expect(api.version()).toBe(packageJson.version);
                api.setup({
                    services: [{ name: 'analytics', title: 'Analytics', purposes: ['analytics'] }],
                    storageMethod: 'test',
                    noAutoLoad: true,
                    lang: 'en',
                });
                expect(api.getManager().getConsent('analytics')).toBe(false);
                expect(api.show(undefined, true)).toBe(false);
                const dialog = () => dom.window.document.querySelector('dialog[open]');
                await vi.waitFor(() => expect(dialog()).not.toBeNull());
                const manager = api.getManager();
                manager.changeAll(true);
                manager.saveAndApplyConsents('accept');
                expect(manager.getConsent('analytics')).toBe(true);
                await vi.waitFor(() => expect(dialog()).toBeNull());
                api.show(undefined, true);
                await vi.waitFor(() => expect(dialog()).not.toBeNull());
            } finally {
                dom.window.close();
            }
        },
    );
});
