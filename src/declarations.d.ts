declare module '*.scss';
declare module '*.yml' {
    const value: Record<string, unknown>;
    export default value;
}
declare module '*.yaml' {
    const value: Record<string, unknown>;
    export default value;
}

declare const VERSION: string;
declare const module: { hot?: unknown };
declare function require(id: string): unknown;

interface Window {
    klaroApiConfigs?: any[];
    [key: string]: any;
}
