import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/preact';
import ConsentNotice from '../src/components/consent-notice';
import ConsentManager from '../src/consent-manager';
import { TestStore } from '../src/stores';

const config = {
    services: [
        { name: 'analytics', purposes: ['analytics'] },
    ],
    translations: {},
};

const t = (key) => {
    const last = Array.isArray(key) ? key[key.length - 1] : key;
    return last;
};

describe('ConsentNotice', () => {
    it('closes a controlled modal before consent is confirmed', () => {
        const hide = vi.fn();
        const manager = new ConsentManager(config, new TestStore());

        const { container } = render(<ConsentNotice
            t={t}
            lang="en"
            config={config}
            hide={hide}
            manager={manager}
            modal
            show
        />);

        const closeButton = container.querySelector('button.hide');
        expect(closeButton).not.toBeNull();

        fireEvent.click(closeButton);

        expect(hide).toHaveBeenCalledOnce();
    });
});
