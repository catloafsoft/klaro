import { describe, expect, it } from 'vitest';
import packageJson from '../package.json';

describe('package exports', () => {
    it('keeps legacy bundles and modern subpath exports addressable', () => {
        expect(packageJson.packageManager).toMatch(/^pnpm@/);
        expect(packageJson.main).toBe('dist/klaro.js');
        expect(packageJson.exports['.'].types).toBe('./types/index.d.ts');
        expect(packageJson.exports['./no-css'].default).toBe('./dist/klaro-no-css.js');
        expect(packageJson.exports['./cm'].types).toBe('./types/consent-manager.d.ts');
        expect(packageJson.exports['./klaro.css']).toBe('./dist/klaro.css');
    });
});
