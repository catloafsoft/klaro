import { replaceCSSVariables } from "./compat"

export function injectStyles(config: any, themes: Record<string, Record<string, any>>, element?: HTMLElement | null): void {

    if (config.styling === undefined)
        return

    let styling: Record<string, string | string[]> = Object.assign({}, config.styling)

    if (styling.theme !== undefined){
        let styleThemes = styling.theme
        if (!(styleThemes instanceof Array)){
            styleThemes = [styleThemes]
        }

        // we reset the styling
        styling = {}

        for(const themeName of styleThemes){
            const theme = themes[themeName]
            if (theme !== undefined){
                // we use the theme as the basic styling
                for(const [key, value] of Object.entries(theme)){
                    if (key.startsWith('_'))
                        continue // private attribute e.g. used for compatibility checking
                    styling[key] = value
                }
            }
        }

        // we allow overriding of specific theme variables
        for(const [key, value] of Object.entries(config.styling)){
            if (key === 'theme')
                continue
            styling[key] = value as string
        }

    }

    if (element === undefined || element === null)
        element = document.documentElement;

    // in modern browsers we can just set the CSS variables
    for(const [key, value] of Object.entries(styling)){
        element.style.setProperty('--'+key, String(value))
    }

    if ((window.document as Document & { documentMode?: unknown }).documentMode && element === document.documentElement) {
        // we dynamically replace the CSS variables in the CSS files as IE
        // cannot handle them... Sigh.
        replaceCSSVariables(styling as Record<string, string>)
    }

}
