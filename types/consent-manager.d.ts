export type ConsentValueMap = Record<string, boolean>;

export interface KlaroStore {
  get(): string | null;
  set(value: string): void;
  delete(): void;
  getWithKey?(key: string): string | null;
  setWithKey?(key: string, value: string): void;
  deleteWithKey?(key: string): void;
}

export interface KlaroWatcher {
  update(manager: ConsentManager, name: string, data?: unknown): void;
}

export interface KlaroCookiePatternObject {
  pattern: string | RegExp;
  path?: string;
  domain?: string;
}

export type KlaroCookiePattern =
  | string
  | RegExp
  | [string | RegExp, string?, string?]
  | KlaroCookiePatternObject;

export interface KlaroService {
  name: string;
  title?: string;
  description?: string;
  purposes?: string[];
  cookies?: KlaroCookiePattern[];
  default?: boolean;
  required?: boolean;
  optOut?: boolean;
  onlyOnce?: boolean;
  contextualConsentOnly?: boolean;
  vars?: Record<string, unknown>;
  translations?: Record<string, unknown>;
  callback?: (consent: boolean, service: KlaroService) => void;
  onInit?: string | ((opts: KlaroHandlerOptions) => void);
  onAccept?: string | ((opts: KlaroHandlerOptions) => void);
  onDecline?: string | ((opts: KlaroHandlerOptions) => void);
}

export interface KlaroHandlerOptions {
  service: KlaroService;
  config: KlaroConfig;
  vars: Record<string, unknown>;
  consents?: ConsentValueMap;
  confirmed?: boolean;
}

export interface KlaroConfig {
  version?: number;
  elementID?: string;
  storageMethod?: 'cookie' | 'localStorage' | 'sessionStorage' | 'test';
  storageName?: string;
  cookieName?: string;
  cookieDomain?: string;
  cookiePath?: string;
  cookieExpiresAfterDays?: number;
  cookieSameSite?: 'Strict' | 'Lax' | 'None';
  cookieSecure?: boolean;
  respectGlobalPrivacyControl?: boolean;
  default?: boolean;
  required?: boolean;
  mustConsent?: boolean;
  acceptAll?: boolean;
  hideDeclineAll?: boolean;
  hideLearnMore?: boolean;
  hideToggleAll?: boolean;
  noAutoLoad?: boolean;
  noNotice?: boolean;
  htmlTexts?: boolean;
  sanitizeHtml?: (html: string) => string;
  embedded?: boolean;
  groupByPurpose?: boolean;
  autoFocus?: boolean;
  showNoticeTitle?: boolean;
  noticeAsModal?: boolean;
  disablePoweredBy?: boolean;
  poweredBy?: string;
  additionalClass?: string;
  stylePrefix?: string;
  lang?: string;
  fallbackLang?: string;
  languages?: string[];
  privacyPolicy?: string | Record<string, string>;
  translations?: Record<string, unknown>;
  services: KlaroService[];
  apps?: KlaroService[];
  callback?: (consent: boolean, service: KlaroService) => void;
  [key: string]: unknown;
}

export default class ConsentManager {
  constructor(config: KlaroConfig, store?: KlaroStore, auxiliaryStore?: KlaroStore);
  config: KlaroConfig;
  consents: ConsentValueMap;
  confirmed: boolean;
  changed: boolean;
  getConsent(name: string): boolean;
  updateConsent(name: string, value: boolean): boolean;
  changeAll(value: boolean): number;
  resetConsents(): void;
  loadConsents(): ConsentValueMap;
  saveConsents(eventType?: string): void;
  saveAndApplyConsents(eventType?: string): void;
  applyConsents(dryRun?: boolean, interactive?: boolean, serviceName?: string): number;
  changedConsents(): ConsentValueMap;
  getService(name: string): KlaroService | undefined;
  watch(watcher: KlaroWatcher): void;
  unwatch(watcher: KlaroWatcher): void;
}
