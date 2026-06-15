import {getCookie, setCookie, deleteCookie} from './utils/cookies'


export class TestStore {
    constructor(){
        this.value = null
    }

    get() {
        return this.value
    }

    set(value) {
        this.value = value;
    }

    // fallow-ignore-next-line unused-class-member
    delete() {
        this.value = null
    }
}

class CookieStore {
    constructor(manager) {
        this.cookieName = manager.storageName
        this.cookieDomain = manager.cookieDomain
        this.cookiePath = manager.cookiePath
        this.cookieExpiresAfterDays = manager.cookieExpiresAfterDays
        this.cookieSameSite = manager.cookieSameSite
        this.cookieSecure = manager.cookieSecure
    }

    get() {
        const cookie = getCookie(this.cookieName);
        return cookie
            ? cookie.value
            : null;
    }

    set(value) {
        return setCookie(this.cookieName, value, this.cookieExpiresAfterDays, this.cookieDomain, this.cookiePath, this.cookieSameSite, this.cookieSecure)
    }

    delete() {
        return deleteCookie(this.cookieName);
    }
}

class StorageStore {
    constructor(manager, handle) {
        this.key = manager.storageName;
        this.handle = handle
    }

    get() {
        try {
            return this.handle.getItem(this.key);
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
            return null;
        }
    }

    getWithKey(key) {
        try {
            return this.handle.getItem(key);
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
            return null;
        }
    }

    set(value) {
        try {
            return this.handle.setItem(this.key, value)
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
        }
    }

    setWithKey(key, value) {
        try {
            return this.handle.setItem(key, value)
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
        }
    }

    delete() {
        try {
            return this.handle.removeItem(this.key);
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
        }
    }

    deleteWithKey(key) {
        try {
            return this.handle.removeItem(key);
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
        }
    }
}

export class LocalStorageStore extends StorageStore {
    constructor(manager){
        super(manager, localStorage)
    }
}

export class SessionStorageStore extends StorageStore {
    constructor(manager){
        super(manager, sessionStorage)
    }
}

const stores = {
    'cookie': CookieStore,
    'test': TestStore,
    'localStorage': LocalStorageStore,
    'sessionStorage': SessionStorageStore,
}

export default stores
