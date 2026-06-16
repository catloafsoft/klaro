import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/preact';
import Text from '../src/components/text';

describe('Text', () => {
    it('renders configured HTML text without raw HTML injection', () => {
        const sanitizeHtml = vi.fn((html) => html);

        render(<Text
            config={{ htmlTexts: true, sanitizeHtml }}
            text={'Read <strong>carefully</strong> <a href="https://example.test" target="_blank">policy</a>'}
        />);

        expect(screen.getByText('carefully').tagName).toBe('STRONG');
        const link = screen.getByRole('link', { name: 'policy' });
        expect(link.getAttribute('href')).toBe('https://example.test');
        expect(link.getAttribute('rel')).toBe('noopener noreferrer');
        expect(sanitizeHtml).toHaveBeenCalledWith('Read <strong>carefully</strong> <a href="https://example.test" target="_blank">policy</a>');
    });

    it('drops unsafe markup from configured HTML text', () => {
        render(<Text
            config={{ htmlTexts: true }}
            text={'<img src=x onerror="alert(1)"><a href="javascript:alert(1)" onclick="alert(1)">bad</a><script>alert(1)</script>'}
        />);

        const link = screen.getByText('bad');
        expect(link.tagName).toBe('A');
        expect(link.hasAttribute('href')).toBe(false);
        expect(link.hasAttribute('onclick')).toBe(false);
        expect(document.querySelector('img')).toBeNull();
        expect(document.querySelector('script')).toBeNull();
    });
});
