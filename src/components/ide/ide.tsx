import React from 'react';
import { Services } from './services';
import { Globals } from './globals';
import { Demo } from './demo';
import { JSONConfig } from './json-config';
import { Configs } from './configs';
import { Styling } from './styling';
import { Translations } from './translations';
import { Tabs, Tab } from './tabs';
import type { ConfigUpdater, KlaroConfig, KlaroService, Translator } from '../../types';

type TabName = 'globals' | 'services' | 'translations' | 'testing' | 'json' | 'styling';

interface IDEState {
    activeConfig?: string;
    configState?: ConfigIDEState;
}

interface ConfigIDEState {
    tab: TabName;
    [key: string]: unknown;
}

interface IDEConfig extends KlaroConfig {
    modified?: boolean;
    name: string;
}

interface IDEProps {
    className?: string;
    configs: IDEConfig[];
    controls?: Record<string, unknown>;
    disabled?: boolean;
    onConfigAction?: (config: IDEConfig, action: string) => void;
    resetConfig: (name: string) => void;
    saveConfig: (name: string) => void;
    deleteConfig: (name: string) => void;
    services?: KlaroService[];
    setState: (state: IDEState) => void;
    state: IDEState;
    t: Translator;
    updateConfig: (configName: string, ...args: Parameters<ConfigUpdater>) => void;
}

const tabComponents = {
    globals: Globals,
    services: Services,
    translations: Translations,
    testing: Demo,
    json: JSONConfig,
    styling: Styling,
};

const IDE = ({ state, setState, className, onConfigAction, configs, t, ...rest }: IDEProps) => {
    const { activeConfig } = state;
    const unsetConfig = () => {
        setState({ activeConfig: undefined });
    };
    const setConfigState = (configState: ConfigIDEState) => {
        setState({ ...state, configState });
    };

    const component = activeConfig !== undefined ? (
        <ConfigIDE
            state={state.configState}
            setState={setConfigState}
            t={t}
            unsetConfig={unsetConfig}
            config={configs.find((config) => config.name === activeConfig)}
            {...rest}
        />
    ) : (
        <Configs
            onConfigAction={onConfigAction}
            onClick={(config: IDEConfig) => setState({ activeConfig: config.name })}
            configs={configs}
            t={t}
        />
    );

    return <div className={className || 'klaro-ide'}>{component}</div>;
};

interface ConfigIDEProps {
    config?: IDEConfig;
    controls?: Record<string, unknown>;
    disabled?: boolean;
    saveConfig: (name: string) => void;
    resetConfig: (name: string) => void;
    services?: KlaroService[];
    state?: ConfigIDEState;
    unsetConfig: () => void;
    setState: (state: ConfigIDEState) => void;
    t: Translator;
    updateConfig: (configName: string, ...args: Parameters<ConfigUpdater>) => void;
}

const ConfigIDE = ({
    t,
    state: configState,
    disabled,
    controls,
    setState,
    config,
    services,
    unsetConfig,
    saveConfig,
    resetConfig,
    updateConfig,
}: ConfigIDEProps) => {
    if (config === undefined)
        return null;
    const state = configState || { tab: 'services' as TabName };
    const { tab } = state;
    const Component = tabComponents[tab];
    const componentState = state[tab];
    const changeTab = (nextTab: TabName) => setState({ tab: nextTab });
    const setComponentState = (nextComponentState: unknown) => {
        setState({ ...state, [tab]: nextComponentState });
    };
    const tabs = ([
        'services',
        'globals',
        'translations',
        'json',
        'styling',
        'testing',
    ] as TabName[]).map((tb) => (
        <Tab key={tb} onClick={() => changeTab(tb)} active={tab === tb}>
            {t(['ide', tb])}
        </Tab>
    ));
    return (
        <>
            <div className="cm-config-controls">
                <h2>
                    <button type="button" className="cm-link" onClick={unsetConfig}>
                        {t(['configs', 'title'])} &rsaquo;
                    </button>{' '}
                    {config.name === 'default' ? t(['configs', 'default', 'title']) : config.name}
                </h2>
                <fieldset>
                    <button
                        type="button"
                        disabled={disabled || !config.modified}
                        className="cm-control-button cm-secondary"
                        onClick={(e) => {
                            e.preventDefault();
                            resetConfig(config.name);
                        }}
                    >
                        {t(['config', 'reset'])}
                    </button>
                    <button
                        type="button"
                        disabled={disabled || !config.modified}
                        className="cm-control-button"
                        onClick={(e) => {
                            e.preventDefault();
                            saveConfig(config.name);
                        }}
                    >
                        {t(['config', 'save'])}
                    </button>
                </fieldset>
            </div>
            <Tabs key="tabs">{tabs}</Tabs>
            <Component
                state={componentState}
                setState={setComponentState}
                disabled={disabled}
                services={services}
                tt={t}
                config={config}
                updateConfig={(...args: Parameters<ConfigUpdater>) => updateConfig(config.name, ...args)}
                controls={controls}
                t={t}
            />
        </>
    );
};

export default IDE;
