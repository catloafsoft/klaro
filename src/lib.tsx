import React from 'react'
import App from './components/app'
import ContextualConsentNotice from './components/contextual-consent-notice'
import ConsentManager from './consent-manager'
import KlaroApi from './utils/api';
import {injectStyles} from './utils/styling'
import {renderComponent} from './utils/render'
import {convertToMap, update} from './utils/maps'
import {t, language} from './utils/i18n'
import {themes} from './themes'
import {currentScript, dataset, applyDataset} from './utils/compat'
export {version} from './utils/version'
export {updateConfigObject as updateConfig} from './utils/config'
import './scss/klaro.scss'

let defaultConfig: any
const defaultTranslations = new Map([])
const eventHandlers: Record<string, Array<(...args: any[]) => any>> = {}
const events: Record<string, any[][]> = {}

// When webpack's hot loading is enabled, enable Preact's support for the
// React Dev Tools browser extension.
if(module.hot)
    require('preact/debug')

export function getElementID(config: any, ide?: boolean){
    return (config.elementID || 'klaro') + (ide ? '-ide' : '')
}

export function getElement(config: any, ide?: boolean){
    const id = getElementID(config, ide)
    let element = document.getElementById(id)
    if (element === null){
        element = document.createElement('div')
        element.id = id
        document.body.appendChild(element)
    }
    return element
}

export function addEventListener(eventType: string, handler: (...args: any[]) => any){
    if (eventHandlers[eventType] === undefined)
        eventHandlers[eventType] = [handler]
    else
        eventHandlers[eventType].push(handler)
    // this event did already fire, we call the handler
    if (events[eventType] !== undefined)
        for(const event of events[eventType])
            if (handler(...event) === false)
                break
}

function executeEventHandlers(eventType: string, ...args: any[]): boolean {
    const handlers = eventHandlers[eventType]
    if (events[eventType] === undefined)
        events[eventType] = [args]
    else
        events[eventType].push(args)
    if (handlers !== undefined)
        for(const handler of handlers){
            if (handler(...args) === true)
                return true
        }
    return false
}

export function getConfigTranslations(config: any){
    const trans = new Map([])
    update(trans, defaultTranslations)
    update(trans, convertToMap(config.translations || {}))
    return trans
}

let cnt = 1
export function render(config: any, opts?: any){
    if (config === undefined)
        return
    opts = opts || {}

    config = validateConfig(config)

    executeEventHandlers("render", config, opts)

    // we are using a count here so that we're able to repeatedly open the modal...
    let showCnt = 0
    if (opts.show)
        showCnt = cnt++
    const element = getElement(config)
    const manager = getManager(config)

    if (opts.api !== undefined)
        manager.watch(opts.api)

    if (opts.api !== undefined && !opts.modal && !opts.show && !manager.confirmed) {
        const shownBefore = manager.auxiliaryStore.getWithKey?.('shown-before')
        if (!shownBefore) {
            opts.api.update(null, 'showNotice', {config: config})
            manager.auxiliaryStore.setWithKey?.('shown-before', true)
        }
    }

    injectStyles(config, themes, element)

    const lang = language(config)
    const configTranslations = getConfigTranslations(config)
    const tt = (...args: [any, ...any[]]) => t(configTranslations, lang, config.fallbackLang || 'zz', ...args)
    const app = renderComponent(<App t={tt}
        lang={lang}
        manager={manager}
        config={config}
        testing={opts.testing}
        modal={opts.modal}
        show={showCnt} />, element)
    renderContextualConsentNotices(manager, tt, lang, config)
    return app
}

export function renderContextualConsentNotices(manager: any, tt: any, lang: string, config: any){
    const notices: any[] = []
    for(const service of config.services){
        const consent = manager.getConsent(service.name) && (manager.confirmed || service.optOut)
        const elements = document.querySelectorAll("[data-name='"+service.name+"']")
        for(const element of elements){
            const trackedElement = element as HTMLElement & { src?: string; width?: number; height?: number };
            const ds = dataset(trackedElement) as Record<string, any>
            if (ds.type === 'placeholder')
                continue
            if (trackedElement.tagName === 'IFRAME' || trackedElement.tagName === 'DIV'){
                let placeholderElement = trackedElement.previousElementSibling as HTMLElement | null
                if (placeholderElement !== null){
                    const ds = dataset(placeholderElement) as Record<string, any>
                    if (ds.type !== "placeholder" || ds.name !== service.name)
                        placeholderElement = null
                }
                if (placeholderElement === null){
                    placeholderElement = document.createElement("DIV")
                    const trackedRect = trackedElement.getBoundingClientRect()
                    const placeholderWidth = trackedElement.width || trackedRect.width
                    const placeholderHeight = trackedElement.height || trackedRect.height
                    const widthStyle = placeholderWidth > 0 ? `width: ${placeholderWidth}px; max-width: 100%;` : 'width: 100%;'
                    const heightStyle = placeholderHeight > 0 ? `height: ${placeholderHeight}px;` : 'min-height: 140px;'
                    placeholderElement.style.cssText = `${widthStyle} ${heightStyle}${consent ? ' display: none;' : ''}`
                    applyDataset({type: 'placeholder', name: service.name}, placeholderElement)
                    // if consent is already given, we still insert an invisble placeholder that
                    // might be revealed later if the user changes the consent decision
                    trackedElement.parentElement?.insertBefore(placeholderElement, trackedElement)
                    const notice = renderComponent(<ContextualConsentNotice t={tt}
                        lang={lang}
                        manager={manager}
                        config={config}
                        service={service}
                        showModal={(modalConfig) => show(modalConfig, true)}
                        style={ds.style} />, placeholderElement)
                    notices.push(notice)

                }
                if (trackedElement.tagName === 'IFRAME'){
                    ds['src'] = trackedElement.src
                }
                const display = trackedElement.style.display
                if (ds['modified-by-klaro'] === undefined && display === undefined)
                    ds['original-display'] = display
                ds['modified-by-klaro'] = 'yes'
                applyDataset(ds, trackedElement)
                if (!consent){
                    trackedElement.src = ''
                    trackedElement.style.display = 'none'
                }
            }
        }
    }
    return notices
}

function showKlaroIDE(script: HTMLScriptElement | null) {
    if (script === null)
        return;
    const baseName = /^(.*)(\/[^/]+)$/.exec(script.src)?.[1] || ''
    const element = document.createElement('script')
    element.src = baseName !== '' ? baseName + '/ide.js' : 'ide.js'
    element.type = "application/javascript"
    for(const attribute of Array.from(script.attributes)){
        element.setAttribute(attribute.name, attribute.value)
    }
    document.head.appendChild(element)
}


function doOnceLoaded(handler: () => void){
    if (/complete|interactive|loaded/.test(document.readyState)){
        handler()
    } else {
        window.addEventListener('DOMContentLoaded', handler)
    }
}

function getKlaroId(script: HTMLScriptElement): string | null {
    const klaroId = script.getAttribute('data-klaro-id')
    if (klaroId !== null)
        return klaroId
    const regexMatch = /.*\/privacy-managers\/([a-f0-9]+)\/klaro.*\.js/.exec(script.src)
    if (regexMatch !== null)
        return regexMatch[1] || null
    return null
}

function getKlaroApiUrl(script: HTMLScriptElement): string | null {
    const klaroApiUrl = script.getAttribute('data-klaro-api-url')
    if (klaroApiUrl !== null)
        return klaroApiUrl
    const regexMatch = /(http(?:s)?:\/\/[^/]+)\/v1\/privacy-managers\/([a-f0-9]+)\/klaro.*\.js/.exec(script.src)
    if (regexMatch !== null)
        return regexMatch[1] || null
    return null
}

function getKlaroConfigName(hashParams: Map<string, string | boolean | undefined>, script: HTMLScriptElement): string {
    // hash parameters always win
    if (hashParams.has('klaro-config')){
        const hashConfigName = hashParams.get('klaro-config')
        if (typeof hashConfigName === 'string')
            return hashConfigName
    }
    // afterwards we check the script tag
    const klaroConfigName = script.getAttribute('data-klaro-config')
    if (klaroConfigName !== null)
        return klaroConfigName
    // if nothing works we return the default value
    return 'default'
}

function getHashParams(){
    return new Map<string, string | boolean | undefined>(
        decodeURI(location.hash.slice(1))
            .split("&")
            .filter((kv) => kv !== '')
            .map((kv) => {
                const [key, value] = kv.split("=")
                if (key === undefined)
                    return ['', value === undefined ? true : value] as [string, string | boolean | undefined]
                return [key, value === undefined ? true : value]
            }),
    )
}

export function validateConfig(config: any){
    const validatedConfig = {...config}
    if (validatedConfig.version === 2)
        return validatedConfig
    if (validatedConfig.apps !== undefined && validatedConfig.services === undefined){
        validatedConfig.services = validatedConfig.apps
        console.warn("Warning, your configuration file is outdated. Please change `apps` to `services`")
        delete validatedConfig.apps
    }
    if (validatedConfig.translations !== undefined){
        if (validatedConfig.translations.apps !== undefined && validatedConfig.services === undefined){
            validatedConfig.translations.services = validatedConfig.translations.apps
            console.warn("Warning, your configuration file is outdated. Please change `apps` to `services` in the `translations` key")
            delete validatedConfig.translations.apps
        }
    }
    return validatedConfig
}

export function setup(config?: any){
    // if no window object is given we return immediately
    if (typeof window === 'undefined')
        return;
    const script = currentScript("klaro");
    const hashParams = getHashParams();
    const testing = hashParams.get('klaro-testing');

    const initialize = (opts: any) => {
        const fullOpts = {...opts, testing: testing}
        if (!defaultConfig.noAutoLoad && ((!defaultConfig.testing) || fullOpts.testing))
            render(defaultConfig, fullOpts)
    }

    if (config !== undefined){
        // we initialize directly with a config
        defaultConfig = config;
        doOnceLoaded(() => initialize({}))
    } else if (script !== null) {
        // we initialize with a script tag
        const scriptElement = script as HTMLScriptElement;
        const klaroId = getKlaroId(scriptElement)
        const klaroApiUrl = getKlaroApiUrl(scriptElement)
        const klaroConfigName = getKlaroConfigName(hashParams, scriptElement);
        if (klaroId !== null){
            // we initialize with an API backend
            const api = new KlaroApi(klaroApiUrl, klaroId, {testing: testing})
            if (window.klaroApiConfigs !== undefined){
                // the configs were already supplied with the Klaro binary

                if (executeEventHandlers("apiConfigsLoaded", window.klaroApiConfigs, api) === true){
                    return
                }

                const config = window.klaroApiConfigs.find((config: any) => config.name === klaroConfigName && (config.status === 'active' || testing))

                if (config !== undefined){
                    defaultConfig = config
                    doOnceLoaded(() => initialize({api: api}))
                } else {
                    executeEventHandlers("apiConfigsFailed", {})
                }

            } else {
                // we load the configs separately...
                api.loadConfig(klaroConfigName).then((config) => {

                    // an event handler can interrupt the initialization, e.g. if it wants to perform
                    // its own initialization given the API configs
                    if (executeEventHandlers("apiConfigsLoaded", [config], api) === true){
                        return
                    }
                    defaultConfig = config
                    doOnceLoaded(() => initialize({api: api}))

                }).catch((err) => {
                    console.error(err, "cannot load Klaro configs")
                    executeEventHandlers("apiConfigsFailed", err)
                })
            }
        } else {
            // we initialize with a local config instead
            const configName = scriptElement.getAttribute('data-klaro-config') || "klaroConfig"
            defaultConfig = window[configName];
            if (defaultConfig !== undefined)
                doOnceLoaded(() => initialize({}))
        }
    }
    // If requested, we show the Klaro IDE
    if (hashParams.has('klaro-ide')){
        showKlaroIDE(script === null ? null : script as HTMLScriptElement)
    }
}

export function show(config?: any, modal?: boolean, api?: any){
    config = config || defaultConfig
    render(config, {show: true, modal: modal, api: api})
    return false
}

/* Consent Managers */

const managers: Record<string, any> = {}

export function resetManagers(){
    for(const key of Object.keys(managers))
        delete managers[key]
}

export function getManager(config?: any){
    config = config || defaultConfig
    const name = config.storageName || config.cookieName || 'default' // deprecated: cookieName
    if (managers[name] === undefined)
        managers[name] = new ConsentManager(validateConfig(config))
    return managers[name]
}


export {language, defaultConfig, defaultTranslations}
