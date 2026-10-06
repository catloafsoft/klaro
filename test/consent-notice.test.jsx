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
    it.each([
        ['accept all', true, '.cm-btn-success', true, 'accept'],
        ['save defaults', false, '.cm-btn-success', false, 'save'],
        ['decline all', true, '.cn-decline', false, 'decline'],
    ])('%s saves consent and closes the notice', (_label, acceptAll, selector, consent, event) => {
        const noticeConfig = { ...config, acceptAll };
        const hide = vi.fn();
        const manager = new ConsentManager(noticeConfig, new TestStore());
        const save = vi.spyOn(manager, 'saveAndApplyConsents');
        const { container } = render(<ConsentNotice t={t} lang="en" config={noticeConfig} hide={hide} manager={manager} show />);

        fireEvent.click(container.querySelector(selector));

        expect(manager.getConsent('analytics')).toBe(consent);
        expect(manager.confirmed).toBe(true);
        expect(save).toHaveBeenCalledWith(event);
        expect(hide).toHaveBeenCalledOnce();
    });

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
