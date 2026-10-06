import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInContext } from 'node:vm';
import { JSDOM } from 'jsdom';
import { execFileSync } from 'node:child_process';
import { dirname } from 'node:path';
import packageJson from '../package.json';

const require = createRequire(import.meta.url);

describe('package exports', () => {
    it('keeps legacy bundles and modern subpath exports addressable', () => {
        for (const name of ['klaro', 'no-css', 'cm', 'translations']) {
            const modern = name === 'klaro' ? packageJson.name : `${packageJson.name}/${name}`;
            const bundle = name === 'no-css' ? 'klaro-no-css' : name;
            expect(require.resolve(`${packageJson.name}/dist/${bundle}`)).toBe(require.resolve(modern));
            expect(require.resolve(`${packageJson.name}/dist/${bundle}.js`)).toBe(require.resolve(modern));
        }
        expect(readFileSync(require.resolve(`${packageJson.name}/klaro.css`), 'utf8')).toContain('.klaro');
    });

    it('exports a usable ConsentManager class to native ESM consumers', () => {
        const script = `
            import assert from 'node:assert/strict';
            import ConsentManager from '${packageJson.name}/cm';
            const store = { get: () => null, set: () => {}, delete: () => {} };
            const manager = new ConsentManager({ services: [] }, store, store);
            assert.deepEqual(manager.consents, {});
            assert.equal(manager.confirmed, false);
            manager.saveConsents();
            assert.equal(manager.confirmed, true);
        `;
        execFileSync(process.execPath, ['--input-type=module', '-e', script], {
            cwd: dirname(require.resolve(`${packageJson.name}/package.json`)),
        });
    });

    it.each(['', '/no-css'])('exposes working named APIs to native ESM consumers of %s', (subpath) => {
        const script = `
            import assert from 'node:assert/strict';
            import * as klaro from '${packageJson.name}${subpath}';
            for (const name of ['setup', 'show', 'getManager', 'resetManagers', 'render', 'updateConfig', 'version'])
                assert.equal(typeof klaro[name], 'function', name);
            assert.equal(klaro.version(), '${packageJson.version}');
            klaro.setup();
            globalThis.sessionStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
            const config = { services: [], storageMethod: 'test' };
            const manager = klaro.getManager(config);
            assert.deepEqual(manager.consents, {});
            manager.saveConsents();
            assert.equal(manager.confirmed, true);
            assert.equal(klaro.getManager(config), manager);
            klaro.resetManagers();
            assert.notEqual(klaro.getManager(config), manager);
        `;
        execFileSync(process.execPath, ['--input-type=module', '-e', script], {
            cwd: dirname(require.resolve(`${packageJson.name}/package.json`)),
        });
    });

    it('exports the ConsentManager class through bundler ESM interop', async () => {
        const { default: ConsentManager } = await import('../cm.mjs');
        const store = { get: () => null, set: () => {}, delete: () => {} };
        expect(new ConsentManager({ services: [] }, store, store).confirmed).toBe(false);
    });

    it.each(['%', '%E0%A4%A'])('handles a malformed page fragment: %s', (fragment) => {
        const dom = new JSDOM('<!doctype html><html><body></body></html>', {
            url: `https://example.test/#${fragment}`,
            runScripts: 'outside-only',
        });
        try {
            runInContext(readFileSync(require.resolve(packageJson.name), 'utf8'), dom.getInternalVMContext());
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
                runInContext(readFileSync(require.resolve(`${packageJson.name}/dist/${bundle}`), 'utf8'), dom.getInternalVMContext());
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
