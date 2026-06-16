import React from 'react';
import { BaseRetractingLabelInput } from './input';

export const SearchSelect = ({search, disabled, label, description, onSelect, setSearch, candidates}: any) => {

    const items = candidates.slice(0, 10).map((candidate: any) => (
        <li
            key={candidate.name}
            className="cm-candidate"
        >
            <button type="button" className="cm-link" onClick={() => onSelect(candidate)}>
                {candidate.value}
                {
                    candidate.description &&
                    <p>
                        {candidate.description}
                    </p>
                }
            </button>
        </li>
    ));

    if (candidates.length > 10)
        items.push(<li key="hasMore" className="cm-candidate">...</li>)

    let searchCandidates
    if (items.length > 0)
        searchCandidates = <ul className="cm-candidates">{items}</ul>;

    return <div className="cm-search-select">
        <div>
            <fieldset disabled={disabled}>
                <BaseRetractingLabelInput
                    onChange={setSearch}
                    label={label}
                    disabled={disabled}
                    description={description}
                    autoComplete="off"
                    value={search}
                >
                    {searchCandidates}
                </BaseRetractingLabelInput>
            </fieldset>
        </div>
    </div>

}
