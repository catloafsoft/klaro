import React, { useState } from 'react';

interface TabsProps {
    children: React.ReactNode;
}

interface TabProps {
    active?: boolean;
    children: React.ReactNode;
    href?: string;
    icon?: React.ReactNode;
    params?: Record<string, unknown>;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const Tabs = ({ children }: TabsProps) => {
    const [active, setActive] = useState(false);
    const toggle = () => setActive((value) => !value);

    return (
        <div className={'cm-tabs' + (active ? ' cm-tabs-active' : '')} onClick={toggle}>
            <span className="cm-tabs-more">&or;</span>
            <ul>{children}</ul>
        </div>
    );
};

export const Tab = ({ active, children, icon, onClick }: TabProps) => (
    <li className={active ? 'cm-tab-is-active' : ''}>
        <button type="button" className="cm-link" onClick={onClick}>
            {icon && <span className="cm-tabs-icon cm-tabs-is-small">{icon}</span>}
            {children}
        </button>
    </li>
);
