export type Dataset = Record<string, string | undefined>;

type LegacyStyleElement = HTMLStyleElement & { styleSheet?: { cssText: string } };
const CSS_VARIABLE_FALLBACK_REGEXES = new Map<string, RegExp>();

function getCSSVariableFallbackRegex(key: string): RegExp {
    let regex = CSS_VARIABLE_FALLBACK_REGEXES.get(key);
    if (regex === undefined) {
        regex = new RegExp("([a-z0-9-]+):[^;]+;[\\s\\n]*\\1:\\s*var\\(--"+key+",\\s*[^\\)]+\\)", 'g');
        CSS_VARIABLE_FALLBACK_REGEXES.set(key, regex);
    }
    return regex;
}

export function currentScript(name: string): HTMLScriptElement | null {
    // most browser support this (but alas, not IE11)
    if (document.currentScript instanceof HTMLScriptElement) return document.currentScript;
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        if (script === undefined)
            continue;
        // if the script src includes the given name (klaro) we return
        // the script and hope for the best
        if (script.src.includes(name)) return script;
    }
    return null
}

export function dataset(element: Element): Dataset {
    const dataset: Dataset = {};
    for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        if (attribute === undefined)
            continue;
        if (attribute.name.startsWith('data-')) {
            dataset[attribute.name.slice(5)] = attribute.value;
        }
    }
    return dataset;
}

export function applyDataset(ds: Dataset, element: Element): void {
    const keys = Object.keys(ds);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === undefined)
            continue;
        const value = ds[key];
        if ((element as any)[key] === value) continue;
        else element.setAttribute('data-' + key, value || '');
    }
}

/*
This replaces CSS variables.
*/
export function replaceCSSVariables(variables: Record<string, string>): void {
    const klaroStyleElements = document.querySelectorAll('style[data-context=klaro-styles]')
    for(const element of Array.from(klaroStyleElements) as LegacyStyleElement[]){
        let css = element.innerText
        const legacyElement = element as LegacyStyleElement;
        if (legacyElement.styleSheet !== undefined) // IE
            css = legacyElement.styleSheet.cssText
        for(const [key, value] of Object.entries(variables)){
            const regex = getCSSVariableFallbackRegex(key)
            css = css.replace(regex, (_: string, name: string) => `${name}: ${value}; ${name}: var(--${key}, ${value})`)
        }
        const newElement = document.createElement("style")
        newElement.setAttribute("type", "text/css")
        newElement.setAttribute("data-context", "klaro-styles")
        const legacyNewElement = newElement as LegacyStyleElement;
        if (legacyNewElement.styleSheet !== undefined){
            legacyNewElement.styleSheet.cssText = css
        } else {
            newElement.innerText = css
        }
        // we remove the old element and insert the new one
        element.parentElement?.appendChild(newElement)
        element.parentElement?.removeChild(element)
    }
}
