import React, { useState } from 'react'
import {getElement} from './lib'
import IDE from './components/ide/ide'
import translations from './translations/ide/index'
import {renderComponent} from './utils/render'
import {currentScript} from './utils/compat'
import {t, language} from './utils/i18n'
import {convertToMap} from './utils/maps'
// we import the IDE styles here
import './scss/ide.scss'

const trans = convertToMap(translations)
let defaultConfig: any

function updateAtPath(target: any, path: (string | number | null)[], value: any, overwrite?: boolean) {
    if (path.length === 0)
        return value;
    const head = path[0];
    const tail = path.slice(1);
    if (head === null || head === undefined)
        return target;
    const next = Array.isArray(target) ? [...target] : {...target};
    next[head] = tail.length === 0 && !overwrite ? value : updateAtPath(next[head] || {}, tail, value, overwrite);
    return next;
}

const IDEShell = ({ config, t }: { config: any; t: any }) => {
    const [state, setState] = useState<any>({ activeConfig: config.name || 'default' });
    const [configs, setConfigs] = useState<any[]>([{...config, name: config.name || 'default', status: config.status || 'active'}]);
    const updateConfig = (configName: string, path: (string | number | null)[], value: any, overwrite?: boolean) => {
        setConfigs((current) => current.map((cfg) => (cfg.name === configName ? {...updateAtPath(cfg, path, value, overwrite), modified: true} : cfg)));
    };
    const markSaved = (name: string) => setConfigs((current) => current.map((cfg) => (cfg.name === name ? {...cfg, modified: false} : cfg)));
    return (
        <IDE
            configs={configs}
            resetConfig={markSaved}
            saveConfig={markSaved}
            deleteConfig={() => undefined}
            setState={setState}
            state={state}
            t={t}
            updateConfig={updateConfig}
        />
    );
};

export function renderIDE(config: any){
    const lang = language(config)
    const element = getElement(config, true)
    const tt = (...args: [any, ...any[]]) => t(trans, lang, config.fallbackLang || 'en', ...args)
    const ide = renderComponent(<IDEShell t={tt} config={config} />, element)
    return ide
}

export function show(conf?: any){
    conf = conf || defaultConfig
    renderIDE(conf)
}

export function version(){
    // we remove the 'v'
    if (VERSION[0] === 'v')
        return VERSION.slice(1)
    return VERSION
}

function initialize(){
    show()
}

function setup(){
    const script = currentScript("klaro");
    if (script !== null && script !== undefined){
        const configName = script.getAttribute('data-config') || "klaroConfig"
        defaultConfig = window[configName]
        // deprecated: config settings should only be loaded via the config
        const scriptStylePrefix = script.getAttribute('data-style-prefix')
        if (scriptStylePrefix !== null)
            defaultConfig.stylePrefix = scriptStylePrefix
        if (defaultConfig !== undefined){
            if (/complete|interactive|loaded/.test(document.readyState))
                initialize()
            else
                window.addEventListener('DOMContentLoaded', initialize)
        }
    }
}

setup()
