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
    const values = {
        acceptAll: 'Accept all',
        acceptSelected: 'Accept selected',
        close: 'Close',
        decline: 'Decline',
        description: 'Choose services',
        learnMore: 'Let me choose',
        name: 'privacy policy',
        ok: 'OK',
        poweredBy: 'Powered by Klaro',
        save: 'Save',
        service: 'service',
        services: 'services',
        title: 'Privacy settings',
    };
    return values[last] || last;
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
