import { describe, expect, it, vi } from 'vitest';
import KlaroApi from '../src/utils/api';

vi.mock('../src/lib', () => ({
    version: () => '1.2.3',
}));

describe('KlaroApi', () => {
    it('encodes GET parameters with fetch', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            status: 200,
            text: () => Promise.resolve('{"ok":true}'),
        });
        globalThis.fetch = fetchMock;

        const api = new KlaroApi('https://example.test', 'abc123', { testing: true });
        const data = await api.loadConfig('default config');

        expect(data).toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://example.test/v1/privacy-managers/abc123/config.json?name=default+config&testing=true',
            { method: 'GET', headers: {}, body: undefined }
        );
    });
});
