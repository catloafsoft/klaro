import React from 'react';
import Spec from './spec';
import { controlMap } from './controls/control-map';

export const Styling = ({ config, disabled, controls, updateConfig, t }: any) => {
    const customControls = controls || {};
    const formControls = Spec.styling.map((stylingField) => {
        const ClassName =
            customControls[stylingField.control] || controlMap[stylingField.control];
        return (
            <ClassName
                disabled={disabled}
                prefix={["styling"]}
                updateConfig={(key: string[], value: any) =>  updateConfig(['styling', ...key], value, true)}
                config={config.styling || {themes: []}}
                t={t}
                key={stylingField.name}
                field={stylingField}
                {...((stylingField as any).controlProps || {})}
            />
        );
    });
    return (
        <React.Fragment>
            <p className="cm-section-description">
                {t(['styling', 'description'])}
            </p>
            <fieldset className="cm-styling-fields" disabled={disabled}>
                {formControls}
            </fieldset>
        </React.Fragment>
    );
};
