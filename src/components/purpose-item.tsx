import React, { useState } from 'react';
import { ServiceItems } from './services';
import { asTitle } from '../utils/strings';
import Text from './text';
import type { ConsentMap, ConsentManagerLike, KlaroConfig, KlaroService, Translator } from '../types';

const EMPTY_PURPOSES: string[] = [];

interface PurposeItemProps {
    allDisabled?: boolean;
    allEnabled?: boolean;
    config: KlaroConfig;
    consents: ConsentMap;
    description?: React.ReactNode;
    lang: string;
    manager: ConsentManagerLike;
    name: string;
    onToggle: (value: boolean) => void;
    onlyRequiredEnabled?: boolean;
    purposes?: string[];
    required?: boolean;
    services: KlaroService[];
    t: Translator;
    title?: string;
}

const PurposeServices = ({ config, consents, lang, manager, services, t }: Pick<PurposeItemProps, "config" | "consents" | "lang" | "manager" | "services" | "t">) => {
    const [servicesVisible, setServicesVisible] = useState(false);
    const toggleServicesVisible = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setServicesVisible((visible) => !visible);
    };

    const handleSpace = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === ' ')
            toggleServicesVisible(e);
    };

    const toggle = (servicesToToggle: KlaroService[], value: boolean) => {
        servicesToToggle.forEach((service) => {
            if (!service.required)
                manager.updateConsent(service.name, value);
        });
    };

    const serviceItems = (
        <ServiceItems
            config={config}
            lang={lang}
            services={services}
            toggle={toggle}
            consents={consents}
            visible={servicesVisible}
            t={t}
        />
    );

    return (
        <div className="cm-services">
            <div className="cm-caret">
                <button
                    type="button"
                    className="cm-link"
                    aria-haspopup="true"
                    aria-expanded={servicesVisible}
                    onClick={toggleServicesVisible}
                    onKeyDown={handleSpace}
                >
                    {(servicesVisible && <span>&#8593;</span>) || <span>&#8595;</span>}{' '}
                    {services.length}{' '}
                    {t(['purposeItem', services.length > 1 ? 'services' : 'service'])}
                </button>
            </div>
            <ul className={'cm-content' + (servicesVisible ? ' expanded' : '')}>
                {serviceItems}
            </ul>
        </div>
    );
};

const PurposeDescription = ({ config, name, description, purposes = EMPTY_PURPOSES, t }: Pick<PurposeItemProps, "config" | "name" | "description" | "purposes" | "t">) => {
    const id = `purpose-item-${name}`;
    const purposesText = purposes
        // react-doctor-disable-next-line react-doctor/no-prop-callback-in-render -- t is a pure translation lookup, not an event callback.
        .map((purpose) => t(['!', 'purposes', purpose, 'title?']) || asTitle(purpose))
        .join(', ');
    const purposesContent = purposes.length > 0 ? (
        <p className="purposes">
            {t(['purpose', purposes.length > 1 ? 'purposes' : 'purpose'])}: {purposesText}
        </p>
    ) : undefined;

    const descriptionText = description || t(['!', 'purposes', name, 'description']);

    return (
        <div id={`${id}-description`}>
            {descriptionText && (
                <p className="cm-list-description">
                    <Text config={config} text={descriptionText} />
                </p>
            )}
            {purposesContent}
        </div>
    );
};

const PurposeItem = ({
    allDisabled = false,
    allEnabled = false,
    config,
    consents,
    description,
    lang,
    manager,
    name,
    onToggle,
    onlyRequiredEnabled = false,
    purposes = EMPTY_PURPOSES,
    required = false,
    services,
    t,
    title,
}: PurposeItemProps) => {
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onToggle(e.target.checked);
    };
    const id = `purpose-item-${name}`;
    const titleid = `${id}-title`;
    const requiredText = required ? (
        <span className="cm-required" title={String(t(['!', 'service', 'required', 'description']) || '')}>
            {t(['service', 'required', 'title'])}
        </span>
    ) : (
        ''
    );

    return (
        <>
            <input
                id={id}
                className={
                    'cm-list-input' +
                    (required ? ' required' : '') +
                    (!allEnabled ? onlyRequiredEnabled ? ' only-required' : ' half-checked' : '')
                }
                aria-labelledby={titleid}
                aria-describedby={`${id}-description`}
                disabled={required}
                checked={allEnabled || (!allDisabled && !onlyRequiredEnabled)}
                type="checkbox"
                onChange={onChange}
            />
            <label htmlFor={id} className="cm-list-label" {...(required ? { tabIndex: 0 } : {})}>
                <span className="cm-list-title" id={titleid}>
                    {title || t(['!', 'purposes', name, 'title?']) || asTitle(name)}
                </span>
                {requiredText}
                <span className="cm-switch">
                    <div className="slider round active"></div>
                </span>
            </label>
            <PurposeDescription config={config} name={name} description={description} purposes={purposes} t={t} />
            {services.length > 0 && <PurposeServices config={config} consents={consents} lang={lang} manager={manager} services={services} t={t} />}
        </>
    );
};

export default PurposeItem;
