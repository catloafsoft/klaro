import React, { useState } from 'react';
import { SearchSelect } from './search-select';

export const ThemesSelect = ({field, disabled, prefix, config, t, updateConfig}: any) => {
    const [search, setSearch] = useState('')
    const themes: Record<string, any> = t.tv.themes
    const existingThemes = new Set(config[field.name] || [])
    const generateInitialThemes = () => Array.from(Object.entries(themes)).filter(([k]) => !existingThemes.has(k)).map(([k, v]) => ({name: k, description: t(['themes', k, 'description']), value: t.lang === 'en' ?  `${v.title.en}` : `${v.title.en} - ${t(['themes', k, 'title'])}`}))
    const [candidates, setCandidates] = useState(() => generateInitialThemes())
    const updateSearch = (value: string) => {
        const candidateThemes = Array.from(Object.entries(themes)).filter(([k]) => !existingThemes.has(k) && (value === '' || k.toLowerCase().includes(value.toLowerCase()) || t(['themes', k, 'title']).toLowerCase().includes(value.toLowerCase())))
        let candidates = candidateThemes.map(cl => ({name: cl[0], description: t(['themes', cl[0], 'description']), value: `${t(['themes', cl[0], 'title'])}`}))
        if (candidates.length > 10)
            candidates = candidates.slice(0, 10)
        setCandidates(candidates)
        setSearch(value)
    }

    const removeTheme = (theme: string) => {
        updateConfig([field.name], config[field.name].filter((th: string) => th !== theme))
        setCandidates(generateInitialThemes())
    }

    const themeItems = Array.from(existingThemes).map((theme: any) => (
        <li key={theme}>{theme} <button type="button" className="cm-link" onClick={() => removeTheme(theme)}>&#10540;</button></li>
    ))

    const selectTheme = (theme: any) => {
        const values = config[field.name] || []
        if (!values.find((value: string) => value === theme.name)){
            values.push(theme.name)
            updateConfig([field.name], values)
        }
        setSearch('')
        setCandidates(generateInitialThemes())
    }

    return <div className="cm-theme-select">
        <ul className="cm-themes">
            {themeItems}
        </ul>
        <SearchSelect disabled={disabled} search={search} onSelect={selectTheme} setSearch={updateSearch} candidates={candidates} label={t(['fields', ...(prefix || []), field.name, 'label'])} description={t(['fields', ...(prefix || []), field.name, 'description'])} />
    </div>
}
