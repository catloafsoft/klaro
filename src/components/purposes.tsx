import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PurposeItem from './purpose-item';
import type { BaseComponentProps, KlaroService, KlaroWatcher } from '../types';

interface ServiceStatus {
    allDisabled: boolean;
    allEnabled: boolean;
    allRequired: boolean;
    onlyRequiredEnabled: boolean;
}

const Purposes = ({ config, t, manager, lang }: BaseComponentProps) => {
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
    const purposes = useMemo(() => {
        const groupedPurposes: Record<string, KlaroService[]> = {};
        for (const service of services) {
            for (const purpose of service.purposes || []) {
                if (groupedPurposes[purpose] === undefined)
                    groupedPurposes[purpose] = [];
                groupedPurposes[purpose].push(service);
            }
        }
        return groupedPurposes;
    }, [services]);

    const toggle = useCallback((purposeKeys: string[], value: boolean) => {
        purposeKeys.forEach((purpose) => {
            const purposeServices = purposes[purpose] || [];
            for (const service of purposeServices) {
                if (!service.required)
                    manager.updateConsent(service.name, value);
            }
        });
    }, [manager, purposes]);

    const toggleAll = (value: boolean) => {
        toggle(Object.keys(purposes), value);
    };

    const checkServices = (servicesToCheck: KlaroService[]): ServiceStatus => {
        const status = {
            allEnabled: true,
            onlyRequiredEnabled: true,
            allDisabled: true,
            allRequired: true,
        };
        for (const service of servicesToCheck) {
            if (!service.required)
                status.allRequired = false;
            if (consents[service.name]) {
                if (!service.required)
                    status.onlyRequiredEnabled = false;
                status.allDisabled = false;
            } else if (!service.required)
                status.allEnabled = false;
        }
        if (status.allDisabled)
            status.onlyRequiredEnabled = false;
        return status;
    };

    const purposeOrder = config.purposeOrder || [];
    const purposeItems = Object.keys(purposes).sort((a, b) => purposeOrder.indexOf(a) - purposeOrder.indexOf(b)).map((purpose) => {
        const togglePurpose = (value: boolean) => {
            toggle([purpose], value);
        };
        const purposeServices = purposes[purpose] || [];
        const status = checkServices(purposeServices);
        return (
            <li key={purpose} className="cm-purpose">
                <PurposeItem
                    allEnabled={status.allEnabled}
                    allDisabled={status.allDisabled}
                    onlyRequiredEnabled={status.onlyRequiredEnabled}
                    required={status.allRequired}
                    consents={consents}
                    name={purpose}
                    config={config}
                    lang={lang}
                    manager={manager}
                    onToggle={togglePurpose}
                    services={purposeServices}
                    t={t}
                />
            </li>
        );
    });

    const togglablePurposes = Object.keys(purposes).filter((purpose) => {
        for (const service of purposes[purpose] || []) {
            if (!service.required)
                return true;
        }
        return false;
    });

    const status = checkServices(services);

    return (
        <ul className="cm-purposes">
            {purposeItems}
            {togglablePurposes.length > 1 && (
                <li className="cm-purpose cm-toggle-all">
                    <PurposeItem
                        name="disableAll"
                        title={String(t(['service', 'disableAll', 'title']))}
                        description={t(['service', 'disableAll', 'description'])}
                        allDisabled={status.allDisabled}
                        allEnabled={status.allEnabled}
                        onlyRequiredEnabled={status.onlyRequiredEnabled}
                        onToggle={toggleAll}
                        manager={manager}
                        consents={consents}
                        config={config}
                        lang={lang}
                        services={[]}
                        t={t}
                    />
                </li>
            )}
        </ul>
    );
};

export default Purposes;
