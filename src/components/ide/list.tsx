import React from "react";
import classnames from "classnames";

interface ListProps {
    children?: React.ReactNode;
    className?: string;
}

interface ListColumnProps {
    children?: React.ReactNode;
    size?: string;
}

interface ListItemProps {
    children?: React.ReactNode;
    isCard?: boolean;
}

export const List = ({ className, children }: ListProps) => (
    <div className={classnames("cm-list", className)}>{children}</div>
);

export const ListHeader = ({ children }: ListProps) => (
    <div className="cm-item cm-is-header">{children}</div>
);

export const ListColumn = ({ children, size = "md" }: ListColumnProps) => (
    <div className={`cm-col cm-is-${size}`}>{children}</div>
);

export const ListItem = ({ children, isCard = true }: ListItemProps) => (
    <div
        className={classnames("cm-item", {
            "cm-is-card": isCard,
        })}
    >
        {children}
    </div>
);
