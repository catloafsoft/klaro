import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/preact';
import ConsentModal from '../src/components/consent-modal';
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
        title: 'Privacy settings',
        description: 'Choose services',
        close: 'Close',
        save: 'Save',
        acceptSelected: 'Accept selected',
        acceptAll: 'Accept all',
        decline: 'Decline',
        poweredBy: 'Powered by Klaro',
        name: 'privacy policy',
    };
    return values[last] || last;
};

describe('ConsentModal', () => {
    it('renders as an accessible dialog and closes on Escape', () => {
        const hide = vi.fn();
        const manager = new ConsentManager(config, new TestStore());

        render(<ConsentModal
            t={t}
            lang="en"
            config={config}
            hide={hide}
            confirming={false}
            declineAndHide={() => {}}
            saveAndHide={() => {}}
            acceptAndHide={() => {}}
            manager={manager}
        />);

        const dialog = screen.getByRole('dialog', { name: 'Privacy settings' });
        expect(dialog.getAttribute('aria-modal')).toBe('true');

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(hide).toHaveBeenCalled();
    });
});
