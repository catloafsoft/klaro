import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/preact';

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
});
