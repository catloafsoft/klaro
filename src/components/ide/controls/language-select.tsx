import React, { useState } from 'react';
import { SearchSelect } from './search-select';

export const LanguageSelect = ({field, disabled, config, prefix, t, updateConfig}: any) => {
    const [search, setSearch] = useState('')
    const languages: Record<string, any> = t.tv.languages
    const generateInitialCandidates = () => Array.from(Object.entries(languages)).filter(([k,])=> !config[field.name].includes(k)).map(([k,v]) => ({name: k, value: `${v.en} - ${v[k]} (${k})`}))
    const [candidates, setCandidates] = useState(() => generateInitialCandidates())
    const existingLanguages = new Set(config[field.name])
    const updateSearch = (value: string) => {
        const candidateLanguages = Array.from(Object.entries(languages)).filter(([k, v]) => !existingLanguages.has(k) && (v[k].toLowerCase().includes(value.toLowerCase()) || v.en.toLowerCase().includes(value.toLowerCase())))
        let candidates = candidateLanguages.map(cl => ({name: cl[0], value: `${cl[1].en} - ${cl[1][cl[0]]} (${cl[0]})`}))
        if (candidates.length > 10)
            candidates = []
        setCandidates(candidates)
        setSearch(value)
    }

    const removeLanguage = (language: string) => {
        updateConfig([field.name], config[field.name].filter((lang: string) => lang !== language))
        setCandidates(generateInitialCandidates())
    }

    const languageItems = config[field.name].map((language: string) => (
        <li key={language}>{language}: {t(['languages', language])} <button type="button" className="cm-link" onClick={() => removeLanguage(language)}>&#10540;</button></li>
    ))

    const selectLanguage = (language: any) => {
        const values = config[field.name]
        if (!values.find((value: string) => value === language.name)){
            config[field.name].push(language.name)
            updateConfig([field.name], config[field.name])
        }
        setSearch('')
        setCandidates(generateInitialCandidates())
    }
    return <div className="cm-language-select">
        <ul className="cm-languages">
            {languageItems}
        </ul>
        <SearchSelect disabled={disabled} search={search} onSelect={selectLanguage} setSearch={updateSearch} candidates={candidates} label={t(['fields', ...(prefix || []), field.name, 'label'])} description={t(['fields', ...(prefix || []), field.name, 'description'])} />
    </div>
}
