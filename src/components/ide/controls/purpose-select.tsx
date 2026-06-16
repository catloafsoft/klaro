import React, { useMemo, useState } from 'react';
import { SearchSelect } from './search-select';

const EMPTY_PURPOSES: string[] = [];

export const PurposeSelect = ({field, disabled, prefix, config, t, updateConfig}: any) => {
    const [search, setSearch] = useState('')
    const purposes: Record<string, any> = t.tv.purposes
    const values = (config[field.name] as string[] | undefined) || EMPTY_PURPOSES
    const candidates = useMemo(() => {
        const existingPurposes = new Set(values)
        const query = search.toLowerCase()
        const candidatePurposes = Array.from(Object.entries(purposes)).filter(([k]) => (
            !existingPurposes.has(k) &&
            (query === '' || k.toLowerCase().includes(query) || String(t(['purposes', k, 'title'])).toLowerCase().includes(query))
        ))
        let nextCandidates = candidatePurposes.map(([k, v]) => ({
            name: k,
            description: t(['purposes', k, 'description']),
            value: t.lang === 'en' ? `${v.title.en}` : `${v.title.en} - ${t(['purposes', k, 'title'])}`,
        }))
        if (nextCandidates.length > 10)
            nextCandidates = []
        if (search !== '')
            nextCandidates.push({name: search, description: t(['purpose', 'descriptionNotice']), value: `${search} (${t(['purpose', 'add'])})`})
        return nextCandidates
    }, [purposes, search, t, values])

    const updateSearch = (value: string) => {
        setSearch(value)
    }

    const removePurpose = (purpose: string) => {
        updateConfig([field.name], values.filter((value: string) => value !== purpose))
    }

    const purposeItems = values.map((purpose: string) => (
        <li key={purpose}>{purpose} <button type="button" className="cm-link" onClick={() => removePurpose(purpose)}>&#10540;</button></li>
    ))

    const selectPurpose = (purpose: any) => {
        if (!values.find((value: string) => value === purpose.name)){
            updateConfig([field.name], [...values, purpose.name])
        }
        setSearch('')
    }

    return <div className="cm-purpose-select">
        <ul className="cm-purposes">
            {purposeItems}
        </ul>
        <SearchSelect disabled={disabled} search={search} onSelect={selectPurpose} setSearch={updateSearch} candidates={candidates} label={t(['fields', ...(prefix || []), field.name, 'label'])} description={t(['fields', ...(prefix || []), field.name, 'description'])} />
    </div>
}
