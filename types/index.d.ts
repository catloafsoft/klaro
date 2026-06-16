import ConsentManager, { KlaroConfig } from './consent-manager';

export { ConsentManager };
export * from './consent-manager';

export function setup(config?: KlaroConfig): void;
export function render(config?: KlaroConfig, opts?: Record<string, unknown>): unknown;
export function show(config?: KlaroConfig, modal?: boolean, api?: unknown): false;
export function getManager(config?: KlaroConfig): ConsentManager;
export function resetManagers(): void;
export function version(): string;
export function addEventListener(eventType: string, handler: (...args: unknown[]) => boolean | void): void;
export function updateConfig(config: Record<string, unknown>, updates: Record<string, unknown>, overwrite?: boolean): Record<string, unknown>;
export const defaultConfig: KlaroConfig | undefined;
export const defaultTranslations: Map<string, unknown>;
