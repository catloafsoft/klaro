import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/preact';
import { Demo } from '../src/components/ide/demo';

vi.mock('../src/translations/index', () => ({ default: {} }));
vi.mock('../src/components/app', () => ({ default: () => null }));
vi.mock('../src/utils/styling', () => ({ injectStyles: vi.fn() }));

function submitSite(siteUrl) {
    const config = { name: 'demo & config', languages: [], services: [] };
    const { container } = render(<Demo t={key => key.join('.')} config={config} />);
    fireEvent.input(screen.getByRole('textbox', { name: 'demo.testOnSite.label' }), { target: { value: siteUrl } });
    fireEvent.submit(container.querySelector('form'));
}

describe('IDE site preview', () => {
    it.each(['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', 'ftp://example.test', 'invalid', ''])('rejects unsafe or invalid destination %s', siteUrl => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        submitSite(siteUrl);
        expect(open).not.toHaveBeenCalled();
    });

    it.each(['http:', 'https:'])('opens a %s destination with the testing fragment', protocol => {
        const open = vi.spyOn(window, 'open').mockImplementation(() => null);
        submitSite(`${protocol}//example.test/path?query=1#old`);
        expect(open).toHaveBeenCalledWith(`${protocol}//example.test/path?query=1#klaro-testing&klaro-config=demo%20%26%20config`, '_blank', 'noopener');
    });
});
