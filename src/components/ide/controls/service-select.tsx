import React, { useState } from 'react';
import { SearchSelect } from './search-select';
import { asTitle } from "../../../utils/strings";
import { getValue } from "../utils/i18n";

export const ServiceSelect = ({field, services, prefix, t, updateConfig}: any) => {
    const [search, setSearch] = useState('')

    const serviceTitle = (service: any) => getValue(service.spec.translations || {}, t.lang, ['title']) || getValue(service.spec.translations || {}, 'zz', ['title'])  || asTitle(service.name)
    const generateCandidates = (services: any[]) => [...services].sort((a, b) => (serviceTitle(a) > serviceTitle(b) ? 1 : -1)).map((service) => ({service: service, name: service.name, value: serviceTitle(service)}))
    const [candidates, setCandidates] = useState(() => generateCandidates(services))

    const searchServices = (query: string) => {
        if (!query)
            return services
        const ms = services.filter((service: any) => serviceTitle(service).toLowerCase().includes(query.toLowerCase()))
        return ms
    }

    const updateSearch = (value: string) => {
        const candidateServices = generateCandidates(searchServices(value))
        if (value !== '')
            candidateServices.unshift({name: value, service: {
                spec: {
                    name: value,
                    cookies: [],
                    purposes: [],
                    requests: [],
                    version: 1,
                }
            }, value: `${value} (${t(['fields', 'services', 'addNew'])})`})
        setCandidates(candidateServices)
        setSearch(value)
    }

    const createService = (candidate?: any) => {
        if (candidate === undefined){
            if (candidate !== '' && candidates.length > 0)
                candidate = candidates[0]
            else
                return;
        }
        updateConfig(['services', null], candidate.service.spec)
        setSearch('')
        setCandidates(generateCandidates(services))
    }

    return <div className="cm-service-select">
        <SearchSelect search={search} onSelect={createService} setSearch={updateSearch} candidates={candidates} label={t(['fields', ...(prefix || []), field.name, 'label'])} description={t(['fields', ...(prefix || []), field.name, 'description'])} />
    </div>
}
