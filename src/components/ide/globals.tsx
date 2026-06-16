import React from 'react';
import Spec from './spec';
import { controlMap } from './controls/control-map';

export const Globals = ({ config, disabled, controls, updateConfig, t }: any) => {
    const customControls = controls || {};
    const formControls = Spec.globals.map((globalField) => {
        const ClassName =
            customControls[globalField.control] || controlMap[globalField.control];
        return (
            <ClassName
                disabled={disabled}
                key={globalField.name}
                updateConfig={updateConfig}
                config={config}
                t={t}
                field={globalField}
                {...(globalField.controlProps || {})}
            />
        );
    });
    return (
        <React.Fragment>
            <p className="cm-section-description">
                {t(['globals', 'description'])}
            </p>
            <fieldset className="cm-global-fields" disabled={disabled}>
                {formControls}
            </fieldset>
        </React.Fragment>
    );
};
