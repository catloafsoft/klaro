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

    it('allows null request data', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            status: 200,
            text: () => Promise.resolve('{"ok":true}'),
        });
        globalThis.fetch = fetchMock;

        const api = new KlaroApi('https://example.test', 'abc123');
        await expect(api.apiRequest('GET', '/health', null)).resolves.toEqual({ ok: true });

        expect(fetchMock).toHaveBeenCalledWith(
            'https://example.test/health',
            { method: 'GET', headers: {}, body: undefined }
        );
    });

    it.each([
        { status: 400, text: '{"detail":"bad input"}', expected: { status: 400, detail: 'bad input' } },
        { status: 503, text: 'Unavailable', expected: { status: 503, text: 'Unavailable' } },
        ...['null', '"Denied"', '42', 'false', '["Denied"]'].map(text => ({
            status: 403, text, expected: { status: 403, text },
        })),
    ])('preserves HTTP $status error details', async ({ status, text, expected }) => {
        globalThis.fetch = vi.fn().mockResolvedValue({ status, text: async () => text });
        const api = new KlaroApi('https://example.test', 'abc123');
        await expect(api.apiRequest('GET', '/config')).rejects.toMatchObject(expected);
    });

    it('reports network failures with status zero', async () => {
        const error = new TypeError('Connection failed');
        globalThis.fetch = vi.fn().mockRejectedValue(error);
        const api = new KlaroApi('https://example.test', 'abc123');
        await expect(api.apiRequest('GET', '/config')).rejects.toMatchObject({ status: 0, error });
    });
});
