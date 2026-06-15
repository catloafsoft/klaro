import React, { useCallback, useEffect, useState } from 'react';
import ServiceItem from './service-item';
import type { BaseComponentProps, ConsentMap, KlaroService, KlaroWatcher } from '../types';

interface ServiceItemsProps {
    config: BaseComponentProps['config'];
    consents: ConsentMap;
    lang: string;
    services: KlaroService[];
    t: BaseComponentProps['t'];
    toggle: (services: KlaroService[], value: boolean) => void;
    visible?: boolean;
}

export const ServiceItems = ({
    services,
    config,
    consents,
    lang,
    toggle,
    visible,
    t,
}: ServiceItemsProps) => {
    return services.map((service) => {
        const toggleService = (value: boolean) => {
            toggle([service], value);
        };
        const checked = consents[service.name];
        return (
            <li key={service.name} className="cm-service">
                <ServiceItem
                    checked={checked || service.required || false}
                    onToggle={toggleService}
                    config={config}
                    lang={lang}
                    visible={visible}
                    t={t}
                    {...service}
                />
            </li>
        );
    });
};

const Services = ({ config, t, manager, lang }: BaseComponentProps) => {
    const [, forceUpdate] = useState(0);
    const { services } = config;

    useEffect(() => {
        const watcher: KlaroWatcher = {
            update: (obj, type) => {
                if (obj === manager && type === 'consents')
                    forceUpdate((value) => value + 1);
            },
        };
        manager.watch(watcher);
        return () => manager.unwatch(watcher);
    }, [manager]);

    const consents = manager.consents;
    const toggle = useCallback((servicesToToggle: KlaroService[], value: boolean) => {
        servicesToToggle.forEach((service) => {
            if (!service.required)
                manager.updateConsent(service.name, value);
        });
    }, [manager]);

    const toggleAll = (value: boolean) => {
        toggle(services, value);
    };

    const serviceItems = (
        <ServiceItems
            config={config}
            lang={lang}
            services={services}
            t={t}
            consents={consents}
            toggle={toggle}
        />
    );

    const togglableServices = services.filter((service) => !service.required);
    const nEnabled = togglableServices.filter((service) => consents[service.name]).length;
    const nRequired = services.filter((service) => service.required).length;
    const allEnabled = nEnabled === togglableServices.length;
    const allDisabled = nEnabled === 0;
    const onlyRequiredEnabled = services.filter((service) => service.required).length > 0 && allDisabled;

    return (
        <ul className="cm-services">
            {serviceItems}
            {!config.hideToggleAll && togglableServices.length > 1 && (
                <li className="cm-service cm-toggle-all">
                    <ServiceItem
                        name="disableAll"
                        title={String(t(['service', 'disableAll', 'title']))}
                        description={t(['service', 'disableAll', 'description'])}
                        checked={allEnabled}
                        config={config}
                        onlyRequiredEnabled={!allEnabled && nRequired > 0 && onlyRequiredEnabled}
                        onToggle={toggleAll}
                        lang={lang}
                        t={t}
                    />
                </li>
            )}
        </ul>
    );
};

export default Services;
