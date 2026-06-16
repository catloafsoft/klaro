import React from 'react';
import type { ConfigUpdater, Translator } from '../../../types';

interface Field {
    name: string;
}

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
    onChange: (value: string) => void;
    value?: string;
}

const Input = ({ value = '', onChange, ...props }: InputProps) => (
    <input
        className="cm-input"
        onChange={(e) => onChange(e.target.value)}
        value={value}
        {...props}
    />
);

interface BaseRetractingLabelInputProps extends InputProps {
    children?: React.ReactNode;
    className?: string;
    description?: React.ReactNode;
    label: React.ReactNode;
    name?: string;
}

export const BaseRetractingLabelInput = ({
    name,
    children,
    className,
    value,
    label,
    description,
    onChange,
    ...props
}: BaseRetractingLabelInputProps) => (
    <div className={'cm-retracting-label-input' + (className ? ' ' + className : '')}>
        <Input
            aria-labelledby={name ? name + '-label' : undefined}
            {...props}
            value={value}
            onChange={onChange}
            className="cm-input"
            placeholder=" "
        />
        <span id={name ? name + '-label' : undefined} aria-hidden="true" className="cm-label">
            {label}
        </span>
        <p className="cm-description">{description}</p>
        {children}
    </div>
);

interface RetractingLabelInputProps extends Omit<Partial<BaseRetractingLabelInputProps>, 'label' | 'description' | 'name' | 'onChange' | 'prefix'> {
    config: Record<string, any>;
    field: Field;
    prefix?: string[];
    t: Translator;
    updateConfig: ConfigUpdater;
}

export const RetractingLabelInput = ({
    t,
    field,
    children,
    prefix,
    config,
    className,
    updateConfig,
    ...props
}: RetractingLabelInputProps) => (
    <BaseRetractingLabelInput
        description={t(['fields', ...(prefix || []), field.name, 'description'])}
        value={String(config[field.name] || '')}
        label={t(['fields', ...(prefix || []), field.name, 'label'])}
        {...props}
        className={className}
        name={field.name}
        onChange={(value) => updateConfig([field.name], value)}
    >
        {children}
    </BaseRetractingLabelInput>
);
