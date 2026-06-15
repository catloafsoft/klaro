import React from 'react';
import { asTitle } from '../utils/strings';
import { t as tt } from '../utils/i18n';
import Text from './text';
import type { KlaroConfig, KlaroService, Translator } from '../types';

interface ServiceItemProps extends KlaroService {
    checked: boolean;
    config: KlaroConfig;
    lang: string;
    onToggle: (value: boolean) => void;
    onlyRequiredEnabled?: boolean;
    t: Translator;
    visible?: boolean;
}

const ServiceItem = ({
    checked,
    config,
    description,
    lang,
    name,
    onToggle,
    onlyRequiredEnabled,
    optOut = false,
    purposes = [],
    required = false,
    title,
    translations,
    t,
    visible = true,
}: ServiceItemProps) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle(e.target.checked);
    };
    const id = `service-item-${name}`;
    const titleid = `${id}-title`;
    const purposesText = purposes
        .map((purpose) => t(['!', 'purposes', purpose, 'title?']) || asTitle(purpose))
        .join(', ');
    const optOutText = optOut ? (
        <span className="cm-opt-out" title={String(t(['service', 'optOut', 'description']))}>
            {t(['service', 'optOut', 'title'])}
        </span>
    ) : (
        ''
    );
    const requiredText = required ? (
        <span className="cm-required" title={String(t(['service', 'required', 'description']))}>
            {t(['service', 'required', 'title'])}
        </span>
    ) : (
        ''
    );

    const purposesContent = purposes.length > 0 ? (
        <p className="purposes">
            {t(['service', purposes.length > 1 ? 'purposes' : 'purpose'])}: {purposesText}
        </p>
    ) : undefined;

    const descriptionText =
        description ||
        tt(translations, lang, 'zz', ['!', 'description']) ||
        t(['!', name, 'description?']);

    return (
        <div>
            <input
                id={id}
                className={
                    'cm-list-input' +
                    (required ? ' required' : '') +
                    (onlyRequiredEnabled ? ' half-checked only-required' : '')
                }
                aria-labelledby={titleid}
                aria-describedby={`${id}-description`}
                disabled={required}
                checked={checked || required}
                tabIndex={visible ? 0 : -1}
                type="checkbox"
                onChange={onChange}
            />
            <label htmlFor={id} className="cm-list-label" {...(required ? { tabIndex: 0 } : {})}>
                <span className="cm-list-title" id={titleid}>
                    {title ||
                        tt(translations, lang, 'zz', ['!', 'title']) ||
                        t(['!', name, 'title?']) ||
                        asTitle(name)}
                </span>
                {requiredText}
                {optOutText}
                <span className="cm-switch">
                    <div className="slider round active"></div>
                </span>
            </label>
            <div id={`${id}-description`}>
                {descriptionText && (
                    <p className="cm-list-description">
                        <Text config={config} text={descriptionText} />
                    </p>
                )}
                {purposesContent}
            </div>
        </div>
    );
};

export default ServiceItem;
