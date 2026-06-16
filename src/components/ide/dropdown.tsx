import React, { useEffect, useRef, useState } from 'react';
import classnames from 'classnames';

interface DropdownMenuProps {
    children: React.ReactNode;
}

interface MenuItemProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    onClick: () => void;
}

interface DropdownProps {
    children: React.ReactNode;
    title: React.ReactNode;
}

export const DropdownMenu = ({ children }: DropdownMenuProps) => (
    <Dropdown title={<span className="cm-icon">&hellip;</span>}>
        <ul className="cm-dropdownmenu">{children}</ul>
    </Dropdown>
);

export const MenuItem = ({ icon, children, onClick }: MenuItemProps) => (
    <li>
        <button
            type="button"
            className="cm-link"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick();
            }}
        >
            {icon && <span className="cm-icon">{icon}</span>}
            <span>{children}</span>
        </button>
    </li>
);

const Dropdown = ({ title, children }: DropdownProps) => {
    const [expanded, setExpanded] = useState(false);
    const [right, setRight] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!expanded)
            return undefined;
        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(false);
        };
        document.addEventListener('click', handleClick, false);
        return () => document.removeEventListener('click', handleClick, false);
    }, [expanded]);

    const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const rect = dropdownRef.current?.getBoundingClientRect();
        if (rect)
            setRight(rect.left > window.innerWidth * 0.5);
        setExpanded((value) => !value);
    };

    return (
        <div ref={dropdownRef} className={classnames('cm-dropdown', { 'is-right': right })}>
            <button aria-expanded={expanded} type="button" tabIndex={0} onClick={handleToggle}>
                {title}
            </button>
            <div
                className={classnames('cm-dropdowncontent', {
                    'cm-dropdownexpanded': expanded,
                })}
            >
                {children}
            </div>
        </div>
    );
};
