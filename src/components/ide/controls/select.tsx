import React from 'react';

export const Select = ({ t, field, config, updateConfig }: any) => {
    const items = field.choices.map((choice: string) => (
        <option key={choice} value={choice}>
            {t(['fields', field.name, 'title'])}:&nbsp;
            {t(['fields', field.name, choice])}
        </option>
    ));
    return (
        <div className="cm-select">
            <select
                value={config[field.name]}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateConfig([field.name], e.target.value)}
            >
                {items}
            </select>
            <p className="cm-description">
                {t(['fields', field.name, 'description'])}
            </p>
        </div>
    );
};
