import {getCookies, deleteCookie} from './utils/cookies'
import {dataset, applyDataset} from './utils/compat'
import stores, { SessionStorageStore } from './stores'
import type { ConsentMap, KlaroConfig, KlaroService, KlaroWatcher } from './types'

export default class ConsentManager {
    config: KlaroConfig;
    store: any;
    auxiliaryStore: any;
    consents: ConsentMap;
    confirmed: boolean;
    changed: boolean;
    states: ConsentMap;
    initialized: Record<string, boolean>;
    executedOnce: Record<string, boolean>;
    savedConsents: ConsentMap;
    watchers: Set<KlaroWatcher>;

    constructor(config: KlaroConfig, store?: any, auxiliaryStore?: any){
        this.config = config // the configuration

        if (store !== undefined)
            this.store = store
        else {
            const Store = stores[this.storageMethod as keyof typeof stores] || stores.cookie
            this.store = new Store(this)
        }

        // we fall back to the cookie-based store if the store is undefined
        if (this.store === undefined)
            this.store = new stores.cookie(this)

        if (auxiliaryStore !== undefined)
            this.auxiliaryStore = auxiliaryStore
        else
            this.auxiliaryStore = new SessionStorageStore(this)

        this.consents = this.defaultConsents // the consent states of the configured services
        this.confirmed = false // true if the user actively confirmed his/her consent
        this.changed = false // true if the service config changed compared to the cookie
        this.states = {} // keep track of the change (enabled, disabled) of individual services
        this.initialized = {} // keep track of which services have been initialized already
        this.executedOnce = {} //keep track of which services have been executed at least once
        this.watchers = new Set([])
        this.loadConsents()
        this.applyConsents()
        this.savedConsents = {...this.consents}
    }

    get storageMethod(): string {
        return String(this.config.storageMethod || 'cookie')
    }

    get storageName(): string {
        return String(this.config.storageName || this.config.cookieName || 'klaro') // deprecated: cookieName
    }

    get cookieDomain(): string | undefined {
        return typeof this.config.cookieDomain === 'string' ? this.config.cookieDomain : undefined
    }

    get cookiePath(): string | undefined {
        return typeof this.config.cookiePath === 'string' ? this.config.cookiePath : undefined
    }

    get cookieExpiresAfterDays(): number {
        return typeof this.config.cookieExpiresAfterDays === 'number' ? this.config.cookieExpiresAfterDays : 120
    }

    get cookieSameSite(): string {
        return typeof this.config.cookieSameSite === 'string' ? this.config.cookieSameSite : 'Lax'
    }

    get cookieSecure(): boolean {
        if (typeof this.config.cookieSecure === 'boolean')
            return this.config.cookieSecure
        return typeof window !== 'undefined' && window.location.protocol === 'https:'
    }

    get defaultConsents(): ConsentMap {
        const consents: ConsentMap = {}
        for(let i=0;i<this.config.services.length;i++){
            const service = this.config.services[i]
            if (service === undefined)
                continue
            consents[service.name] = this.getDefaultConsent(service)
        }
        return consents
    }

    watch(watcher: KlaroWatcher): void {
        if (!this.watchers.has(watcher))
            this.watchers.add(watcher)
    }

    unwatch(watcher: KlaroWatcher): void {
        if (this.watchers.has(watcher))
            this.watchers.delete(watcher)
    }

    notify(name: string, data?: unknown, _extra?: unknown): void {
        this.watchers.forEach((watcher) => {
            watcher.update(this, name, data)
        })
    }

    getService(name: string): KlaroService | undefined {
        const matchingServices = this.config.services.filter((service) => service.name === name)
        if (matchingServices.length > 0)
            return matchingServices[0]
        return undefined
    }

    getDefaultConsent(service: KlaroService): boolean {
        if (this.config.respectGlobalPrivacyControl && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl && !service.required)
            return false
        let consent = service.default as boolean | undefined
        if (consent === undefined)
            consent = service.required
        if (consent === undefined)
            consent = this.config.default
        if (consent === undefined)
            consent = false
        return consent
    }

    changeAll(value: boolean): number {
        let changedServices = 0
        this.config.services.filter(service => !service.contextualConsentOnly).map(service => {
            if(service.required || this.config.required || value) {
                if (this.updateConsent(service.name, true))
                    changedServices++
            } else {
                if (this.updateConsent(service.name, false))
                    changedServices++
            }
        })
        return changedServices
    }

    updateConsent(name: string, value: boolean): boolean {
        const changed = (this.consents[name] || false) !== value
        this.consents[name] = value
        this.notify('consents', this.consents)
        return changed
    }

    resetConsents(): void {
        this.consents = this.defaultConsents
        this.states = {}
        this.confirmed = false
        this.applyConsents()
        this.savedConsents = {...this.consents}
        this.store.delete()
        this.notify('consents', this.consents)
    }

    getConsent(name: string): boolean {
        return this.consents[name] || false
    }

    loadConsents(): ConsentMap {
        const consentData = this.store.get();
        if (consentData !== null){
            try {
                this.consents = JSON.parse(decodeURIComponent(consentData))
                this._checkConsents()
                this.notify('consents', this.consents)
            } catch (e) {
                console.warn('Could not parse Klaro consent data, resetting stored consents:', e)
                this.store.delete()
                this.consents = this.defaultConsents
                this.confirmed = false
                this.changed = true
            }
        }
        return this.consents
    }

    saveAndApplyConsents(eventType?: string): void {
        this.saveConsents(eventType)
        this.applyConsents()
    }

    changedConsents(): ConsentMap {
        const cc: ConsentMap = {}
        for(const [k, v] of Object.entries(this.consents)){
            if (this.savedConsents[k] !== v)
                cc[k] = v
        }
        return cc
    }

    saveConsents(eventType?: string): void {
        const v = encodeURIComponent(JSON.stringify(this.consents))
        this.store.set(v);
        this.confirmed = true
        this.changed = false
        const changes = this.changedConsents()
        this.savedConsents = {...this.consents}
        this.notify('saveConsents', {changes: changes, consents: this.consents, type: eventType || 'script'})
    }

    applyConsents(dryRun?: boolean, interactive?: boolean, serviceName?: string): number {

        function executeHandler(handler: unknown, opts: Record<string, unknown>) {
            if (handler === undefined)
                return
            let handlerFunction
            if (typeof handler === 'function'){
                handlerFunction = handler
            } else {
                console.warn('Klaro string handlers are no longer executed. Use function handlers instead.')
                return
            }
            return handlerFunction(opts)
        }

        let changedServices = 0

        // we make sure all services are properly initialized
        for(let i=0;i<this.config.services.length;i++){
            const service = this.config.services[i]
            if (service === undefined)
                continue
            if (serviceName !== undefined && serviceName !== service.name)
                continue
            const vars = service.vars || {}
            const handlerOpts = {service: service, config: this.config, vars: vars}
            // we execute the init function of the service (if it is defined)
            if (!this.initialized[service.name]){
                this.initialized[service.name] = true
                executeHandler(service.onInit, handlerOpts)
            }
        }

        for(let i=0;i<this.config.services.length;i++){
            const service = this.config.services[i]
            if (service === undefined)
                continue
            if (serviceName !== undefined && serviceName !== service.name)
                continue
            const state = this.states[service.name]
            const vars = service.vars || {}
            const optOut = service.optOut !== undefined ? Boolean(service.optOut) : Boolean(this.config.optOut || false)
            const required = service.required !== undefined ? Boolean(service.required) : Boolean(this.config.required || false)
            //opt out and required services are always treated as confirmed
            const confirmed = Boolean(this.confirmed || optOut || dryRun || interactive)
            const consent = Boolean((this.getConsent(service.name) && confirmed) || required)
            const handlerOpts = {service: service, config: this.config, vars: vars, consents: this.consents, confirmed: this.confirmed}

            if (state !== consent)
                changedServices++

            if (dryRun)
                continue

            // we execute custom service handlers (if they are defined)
            executeHandler(consent ? service.onAccept : service.onDecline, handlerOpts)
            this.updateServiceElements(service, consent)
            this.updateServiceStorage(service, consent)

            // we execute the service callback (if one is defined)
            if (typeof service.callback === 'function')
                service.callback(consent, service)

            // we execute the global callback (if one is defined)
            if (typeof this.config.callback === 'function')
                this.config.callback(consent, service)

            this.states[service.name] = consent
        }
        this.notify('applyConsents', changedServices, serviceName)
        return changedServices
    }

    updateServiceElements(service: KlaroService, consent: boolean): void {

        // we make sure we execute this service only once if the option is set
        if (consent){
            if (service.onlyOnce && this.executedOnce[service.name])
                return
            this.executedOnce[service.name] = true
        }

        const elements = document.querySelectorAll("[data-name='"+service.name+"']")
        for(let i=0;i<elements.length;i++){

            const element = elements[i] as any
            if (element === undefined)
                continue

            const parent = element.parentElement
            if (parent === null)
                continue
            const ds = dataset(element)
            const {type, src, href} = ds
            const attrs = ['href', 'src', 'type']

            // we handle placeholder elements here...
            if (type === 'placeholder'){
                if (consent){
                    element.style.display = 'none';
                    ds['original-display'] = element.style.display;
                }
                else{
                    element.style.display = ds['original-display'] || 'block';
                }
                continue
            }

            if (element.tagName === 'IFRAME'){
                // this element is already active, we do not touch it...
                if (consent && element.src === src){
                    // eslint-disable-next-line no-console
                    console.debug(`Skipping ${element.tagName} for service ${service.name}, as it already has the correct type...`)
                    continue
                }
                // we create a new script instead of updating the node in
                // place, as the script won't start correctly otherwise
                const newElement = document.createElement(element.tagName) as any
                for(const attribute of element.attributes){
                    if (attribute.name === 'style') {
                        const [styleProperty, styleValue] = attribute.value.split(':')
                        if (styleProperty !== undefined && styleValue !== undefined)
                            newElement.style[styleProperty.trim()] = styleValue.trim()
                    } else {
                        newElement.setAttribute(attribute.name, attribute.value)
                    }
                }
                newElement.innerText = element.innerText
                newElement.text = element.text

                if (consent){
                    if (ds['original-display'] !== undefined)
                        newElement.style.display = ds['original-display']
                    if (ds.src !== undefined)
                        newElement.src = ds.src
                } else {
                    newElement.src = ''
                    if (ds['modified-by-klaro'] !== undefined && ds['original-display'] !== undefined) // this is already a placeholder
                        newElement.setAttribute('data-original-display', ds['original-display'])
                    else {// this is a new element we haven't touched before
                        if (element.style.display !== undefined)
                            newElement.setAttribute('data-original-display', element.style.display)
                        newElement.setAttribute('data-modified-by-klaro', 'yes')
                    }
                    newElement.style.display = 'none'
                }
                //we remove the original element and insert a new one
                parent.insertBefore(newElement, element)
                parent.removeChild(element)
            } else if (element.tagName === 'SCRIPT' || element.tagName === 'LINK'){
                // this element is already active, we do not touch it...
                if (consent && element.type === (type || "") && element.src === src){
                    // eslint-disable-next-line no-console
                    console.debug(`Skipping ${element.tagName} for service ${service.name}, as it already has the correct type or src...`)
                    continue
                }
                // we create a new script instead of updating the node in
                // place, as the script won't start correctly otherwise
                const newElement = document.createElement(element.tagName) as any
                for(const attribute of element.attributes){
                    newElement.setAttribute(attribute.name, attribute.value)
                }

                if (element.hasAttribute('nonce')) {
                    newElement.setAttribute('nonce', element.nonce)
                }
                newElement.innerText = element.innerText
                newElement.text = element.text

                if (consent){
                    newElement.type = type || ""
                    if (src !== undefined)
                        newElement.src = src
                    if (href !== undefined)
                        newElement.href = href
                } else {
                    newElement.type = 'text/plain'
                }
                //we remove the original element and insert a new one
                parent.insertBefore(newElement, element)
                parent.removeChild(element)
            } else {
                // all other elements (images etc.) are modified in place...
                if (consent){
                    for(const attr of attrs){
                        const attrValue = ds[attr]
                        if (attrValue === undefined)
                            continue
                        if (ds['original-'+attr] === undefined)
                            ds['original-'+attr] = element[attr]
                        element[attr] = attrValue
                    }
                    if (ds.title !== undefined)
                        element.title = ds.title
                    if (ds['original-display'] !== undefined){
                        element.style.display = ds['original-display']
                    } else {
                        element.style.removeProperty('display')
                    }
                }
                else{
                    if (ds.title !== undefined)
                        element.removeAttribute('title')
                    if (ds['original-display'] === undefined && element.style.display !== undefined)
                        ds['original-display'] = element.style.display
                    element.style.display = 'none'
                    for(const attr of attrs){
                        const attrValue = ds[attr]
                        if (attrValue === undefined)
                            continue
                        if (ds['original-'+attr] !== undefined)
                            element[attr] = ds['original-'+attr]
                        else
                            element.removeAttribute(attr)
                    }
                }
                applyDataset(ds, element)
            }
        }

    }

    updateServiceStorage(service: KlaroService, consent: boolean): void {

        if (consent)
            return

        function escapeRegexStr(str: string) {
            return str.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&");
        }

        if (service.cookies !== undefined && service.cookies.length > 0){
            const cookies = getCookies()
            for(let i=0;i<service.cookies.length;i++){
                let cookiePattern: any = service.cookies[i]
                let cookiePath: string | undefined
                let cookieDomain: string | undefined
                if (cookiePattern instanceof Array){
                    [cookiePattern, cookiePath, cookieDomain] = cookiePattern
                } else if (cookiePattern instanceof Object && !(cookiePattern instanceof RegExp)){
                    const cp = cookiePattern
                    cookiePattern = cp.pattern
                    cookiePath = cp.path as string | undefined
                    cookieDomain = cp.domain as string | undefined
                }
                if (cookiePattern === undefined)
                    continue
                if (!(cookiePattern instanceof RegExp)){
                    if (cookiePattern.startsWith('^')) // we assume this is already a regex
                        cookiePattern = new RegExp(cookiePattern)
                    else // we assume this is a normal string
                        cookiePattern = new RegExp('^'+escapeRegexStr(cookiePattern)+'$')
                }
                for(let j=0;j<cookies.length;j++){
                    const cookie = cookies[j]
                    if (cookie === undefined)
                        continue
                    const match = cookiePattern.exec(cookie.name)
                    if (match !== null){
                        // eslint-disable-next-line no-console
                        console.debug("Deleting cookie:", cookie.name,
                            "Matched pattern:", cookiePattern,
                            "Path:", cookiePath,
                            "Domain:", cookieDomain)
                        deleteCookie(cookie.name, cookiePath, cookieDomain)
                        // if no cookie domain is given, we also try to delete the cookie with
                        // domain '.[current domain]' as some services set cookies for this
                        // dotted domain explicitly (e.g. the Facebook pixel).
                        if (cookieDomain === undefined)
                            deleteCookie(cookie.name, cookiePath, '.'+window.location.hostname)
                    }
                }
            }
        }
    }

    _checkConsents(): void {
        let complete = true
        const services = new Set(this.config.services.map((service)=>{return service.name}))
        const consents = new Set(Object.keys(this.consents))
        for(const key of Object.keys(this.consents)){
            if (!services.has(key)){
                delete this.consents[key]
            }
        }
        for(const service of this.config.services){
            if (!consents.has(service.name)){
                this.consents[service.name] = this.getDefaultConsent(service)
                complete = false
            }
        }
        this.confirmed = complete
        if (!complete)
            this.changed = true
    }

}
