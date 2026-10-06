import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { JSONConfig } from '../src/components/ide/json-config';
import { Select } from '../src/components/ide/controls/select';
import { PurposeOrder } from '../src/components/ide/controls/purpose-order';

afterEach(() => vi.unstubAllGlobals());

describe('IDE controls', () => {
    it('updates the named selection control', () => {
        const updateConfig = vi.fn();
        const t = (key) => key.join('.');
        render(<Select t={t} field={{ name: 'storageMethod', choices: ['cookie', 'localStorage'] }} config={{ storageMethod: 'cookie' }} updateConfig={updateConfig} />);
        const select = screen.getByRole('combobox', { name: 'fields.storageMethod.title' });
        select.value = 'localStorage';
        // The Preact helper rewrites all change events to input, including selects.
        fireEvent(select, new Event('change', { bubbles: true }));
        expect(updateConfig).toHaveBeenCalledWith(['storageMethod'], 'localStorage');
    });

    it('keeps configured purpose order and appends newly used purposes', () => {
        const updateConfig = vi.fn();
        const t = Object.assign((key) => key.join('.'), { lang: 'en', tv: {} });
        render(<PurposeOrder t={t} config={{
            purposeOrder: ['ads', 'analytics'],
            services: [{ purposes: ['analytics', 'ads', 'video'] }, {}],
            translations: {},
        }} updateConfig={updateConfig} />);
        const items = screen.getAllByRole('listitem');
        expect(items.map(item => item.querySelector('.cm-value').textContent)).toEqual(['ads', 'analytics', 'video']);
        fireEvent.click(items[1].querySelector('button'));
        expect(updateConfig).toHaveBeenCalledWith(['purposeOrder'], ['analytics', 'ads', 'video']);
    });

    it('releases JSON download URLs when the configuration changes or the control unmounts', async () => {
        const createObjectURL = vi.fn().mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second');
        const revokeObjectURL = vi.fn();
        vi.stubGlobal('URL', class extends URL {
            static createObjectURL = createObjectURL;
            static revokeObjectURL = revokeObjectURL;
        });
        const props = { t: key => key.join('.'), updateConfig: vi.fn() };
        const { rerender, unmount } = render(<JSONConfig {...props} config={{ name: 'first' }} />);
        await waitFor(() => expect(screen.getByRole('link').getAttribute('href')).toBe('blob:first'));
        rerender(<JSONConfig {...props} config={{ name: 'second' }} />);
        await waitFor(() => expect(screen.getByRole('link').getAttribute('href')).toBe('blob:second'));
        expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
        expect(createObjectURL.mock.calls[1][0].type).toBe('application/json');
        unmount();
        await waitFor(() => expect(revokeObjectURL).toHaveBeenCalledWith('blob:second'));
    });
});
