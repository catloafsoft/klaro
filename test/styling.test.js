import { describe, expect, it, vi } from 'vitest';
import { injectStyles } from '../src/utils/styling';

describe('injectStyles', () => {
    it('does not require document when styling is configured', () => {
        vi.stubGlobal('document', undefined);

        expect(() => injectStyles({ styling: { color: '#fff' } }, {})).not.toThrow();

        vi.unstubAllGlobals();
    });
});
