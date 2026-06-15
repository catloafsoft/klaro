import {getCookie, setCookie, deleteCookie} from './utils/cookies'
import type { KlaroStore } from './types';

interface StoreManager {
    storageName: string;
    cookieDomain?: string;
    cookiePath?: string;
    cookieExpiresAfterDays?: number;
    cookieSameSite?: string;
    cookieSecure?: boolean;
}

export class TestStore implements KlaroStore {
    value: string | null;

    constructor(){
        this.value = null
    }

    get() {
        return this.value
    }

    set(value: string) {
        this.value = value;
    }

    // fallow-ignore-next-line unused-class-member
    delete() {
        this.value = null
    }
}

class CookieStore implements KlaroStore {
    cookieName: string;
    cookieDomain?: string;
    cookiePath?: string;
    cookieExpiresAfterDays?: number;
    cookieSameSite?: string;
    cookieSecure?: boolean;

    constructor(manager: StoreManager) {
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

    set(value: string) {
        return setCookie(this.cookieName, value, this.cookieExpiresAfterDays, this.cookieDomain, this.cookiePath, this.cookieSameSite, this.cookieSecure)
    }

    delete() {
        return deleteCookie(this.cookieName);
    }
}

class StorageStore implements KlaroStore {
    key: string;
    handle: Storage;

    constructor(manager: StoreManager, handle: Storage) {
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

    getWithKey(key: string) {
        try {
            return this.handle.getItem(key);
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
            return null;
        }
    }

    set(value: string) {
        try {
            return this.handle.setItem(this.key, value)
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
        }
    }

    setWithKey(key: string, value: string | boolean) {
        try {
            return this.handle.setItem(key, String(value))
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

    deleteWithKey(key: string) {
        try {
            return this.handle.removeItem(key);
        } catch (e) {
            console.warn('Klaro storage is unavailable:', e);
        }
    }
}

export class LocalStorageStore extends StorageStore {
    constructor(manager: StoreManager){
        super(manager, localStorage)
    }
}

export class SessionStorageStore extends StorageStore {
    constructor(manager: StoreManager){
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
