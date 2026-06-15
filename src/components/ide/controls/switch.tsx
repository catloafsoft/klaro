import React from 'react';

export const Switch = ({ t, field, prefix, config, updateConfig }: any) => {
    const name = field.name;
    const value = config[name];
    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => updateConfig([name], e.target.checked);
    const titleId = `fields-${name}-label`;
    return (
        <div className="cm-switch-container">
            <input
                id={'fields-' + name}
                className={'cm-list-input'}
                aria-labelledby={titleId}
                aria-describedby={`${name}-description`}
                checked={value}
                type="checkbox"
                onChange={onChange}
            />
            <label htmlFor={'fields-' + name} className="cm-list-label">
                <span className="cm-list-title" id={titleId}>
                    {t(['fields', ...(prefix || []), name, 'label'])}
                </span>
                <span className="cm-switch">
                    <div className="slider round active"></div>
                </span>
            </label>
            <div id={`${name}-description`}>
                <p className="cm-list-description">
                    {t(['fields', ...(prefix || []), name, 'description'])}
                </p>
            </div>
        </div>
    );
};
