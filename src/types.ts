import type React from 'react';

export type TranslationKey = Array<string | number>;
export type Translator = ((
    key: TranslationKey,
    data?: Record<string, React.ReactNode>,
) => React.ReactNode) & {
    lang?: string;
    tv?: any;
};

export type ConsentMap = Record<string, boolean>;

export interface KlaroStore {
    get(): string | null;
    set(value: string): void;
    delete(): void;
    getWithKey?(key: string): string | null;
    setWithKey?(key: string, value: string | boolean): void;
    deleteWithKey?(key: string): void;
}

export interface KlaroService {
    _id?: string | number;
    id?: string | number;
    name: string;
    title?: string;
    description?: React.ReactNode;
    purposes?: string[];
    required?: boolean;
    optOut?: boolean;
    onlyOnce?: boolean;
    contextualConsentOnly?: boolean;
    translations?: Record<string, unknown>;
    spec?: KlaroService;
    cookies?: Array<Record<string, unknown>>;
    [key: string]: unknown;
}

export interface KlaroConfig {
    acceptAll?: boolean;
    additionalClass?: string;
    autoFocus?: boolean;
    default?: boolean;
    disablePoweredBy?: boolean;
    embedded?: boolean;
    fallbackLang?: string;
    groupByPurpose?: boolean;
    hideDeclineAll?: boolean;
    hideLearnMore?: boolean;
    hideToggleAll?: boolean;
    htmlTexts?: boolean;
    languages?: string[];
    mustConsent?: boolean;
    noNotice?: boolean;
    noticeAsModal?: boolean;
    poweredBy?: string;
    privacyPolicy?: string | Record<string, string>;
    purposeOrder?: string[];
    sanitizeHtml?: (html: string) => string;
    services: KlaroService[];
    showNoticeTitle?: boolean;
    stylePrefix?: string;
    translations?: Record<string, unknown>;
    [key: string]: unknown;
}

export interface KlaroWatcher {
    update(manager: ConsentManagerLike, name: string, data?: unknown): void;
}

export interface ConsentManagerLike {
    auxiliaryStore: KlaroStore;
    changed: boolean;
    confirmed: boolean;
    consents: ConsentMap;
    store: KlaroStore;
    applyConsents(dryRun?: boolean, interactive?: boolean, serviceName?: string): number;
    changeAll(value: boolean): number;
    getConsent(name: string): boolean;
    saveAndApplyConsents(eventType?: string): void;
    saveConsents(eventType?: string): void;
    unwatch(watcher: KlaroWatcher): void;
    updateConsent(name: string, value: boolean): boolean;
    watch(watcher: KlaroWatcher): void;
}

export interface BaseComponentProps {
    config: KlaroConfig;
    lang: string;
    manager: ConsentManagerLike;
    t: Translator;
}

export type ConfigUpdater = (path: Array<string | number | null>, value: unknown, overwrite?: boolean) => void;
