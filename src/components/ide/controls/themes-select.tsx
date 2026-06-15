import React, { useMemo, useState } from 'react';
import { SearchSelect } from './search-select';

const EMPTY_THEMES: string[] = [];

export const ThemesSelect = ({field, disabled, prefix, config, t, updateConfig}: any) => {
    const [search, setSearch] = useState('')
    const themes: Record<string, any> = t.tv.themes
    const values = (config[field.name] as string[] | undefined) || EMPTY_THEMES
    const existingThemes = useMemo(() => new Set(values), [values])
    const candidates = useMemo(() => {
        const query = search.toLowerCase()
        const candidateThemes = Array.from(Object.entries(themes)).filter(([k]) => (
            !existingThemes.has(k) &&
            (query === '' || k.toLowerCase().includes(query) || String(t(['themes', k, 'title'])).toLowerCase().includes(query))
        ))
        const list = candidateThemes.map(([k, v]) => ({
            name: k,
            description: t(['themes', k, 'description']),
            value: t.lang === 'en' ? `${v.title.en}` : `${v.title.en} - ${t(['themes', k, 'title'])}`,
        }))
        return list.length > 10 ? list.slice(0, 10) : list
    }, [existingThemes, search, t, themes])

    const removeTheme = (theme: string) => {
        updateConfig([field.name], values.filter((th: string) => th !== theme))
    }

    const themeItems = Array.from(existingThemes).map((theme: any) => (
        <li key={theme}>{theme} <button type="button" className="cm-link" onClick={() => removeTheme(theme)}>&#10540;</button></li>
    ))

    const selectTheme = (theme: any) => {
        if (!values.find((value: string) => value === theme.name)){
            updateConfig([field.name], [...values, theme.name])
        }
        setSearch('')
    }

    return <div className="cm-theme-select">
        <ul className="cm-themes">
            {themeItems}
        </ul>
        <SearchSelect disabled={disabled} search={search} onSelect={selectTheme} setSearch={setSearch} candidates={candidates} label={t(['fields', ...(prefix || []), field.name, 'label'])} description={t(['fields', ...(prefix || []), field.name, 'description'])} />
    </div>
}
