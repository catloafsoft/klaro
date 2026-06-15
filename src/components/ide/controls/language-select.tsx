import React, { useMemo, useState } from 'react';
import { SearchSelect } from './search-select';

const EMPTY_LANGUAGES: string[] = [];

export const LanguageSelect = ({field, disabled, config, prefix, t, updateConfig}: any) => {
    const [search, setSearch] = useState('')
    const languages: Record<string, any> = t.tv.languages
    const currentLanguages = (config[field.name] as string[] | undefined) || EMPTY_LANGUAGES
    const existingLanguages = useMemo(() => new Set(currentLanguages), [currentLanguages])
    const candidates = useMemo(() => {
        const query = search.toLowerCase()
        const candidateLanguages = Array.from(Object.entries(languages)).filter(([k, v]) => (
            !existingLanguages.has(k) &&
            (query === '' || String(v[k]).toLowerCase().includes(query) || String(v.en).toLowerCase().includes(query))
        ))
        const list = candidateLanguages.map(([k, v]) => ({name: k, value: `${v.en} - ${v[k]} (${k})`}))
        return list.length > 10 ? [] : list
    }, [existingLanguages, languages, search])

    const removeLanguage = (language: string) => {
        updateConfig([field.name], currentLanguages.filter((lang: string) => lang !== language))
    }

    const languageItems = currentLanguages.map((language: string) => (
        <li key={language}>{language}: {t(['languages', language])} <button type="button" className="cm-link" onClick={() => removeLanguage(language)}>&#10540;</button></li>
    ))

    const selectLanguage = (language: any) => {
        if (!currentLanguages.find((value: string) => value === language.name)){
            updateConfig([field.name], [...currentLanguages, language.name])
        }
        setSearch('')
    }
    return <div className="cm-language-select">
        <ul className="cm-languages">
            {languageItems}
        </ul>
        <SearchSelect disabled={disabled} search={search} onSelect={selectLanguage} setSearch={setSearch} candidates={candidates} label={t(['fields', ...(prefix || []), field.name, 'label'])} description={t(['fields', ...(prefix || []), field.name, 'description'])} />
    </div>
}
