declare const VERSION: string;

export function version(..._args: unknown[]): string {
    // we remove the 'v'
    if (VERSION[0] === 'v')
        return VERSION.slice(1)
    return VERSION
}
