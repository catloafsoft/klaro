import React from "react";
import { List, ListHeader, ListItem, ListColumn } from "./list";
import { DropdownMenu, MenuItem } from "./dropdown";
import type { Translator } from "../../types";

interface IDEConfig {
    [key: string]: any;
    name: string;
    status?: string;
}

interface ConfigItemProps {
    config: IDEConfig;
    onClick: (config: any) => void;
    onConfigAction?: (config: any, action: string) => void;
    t: Translator;
}

const ConfigItem = ({t, config, onConfigAction, onClick}: ConfigItemProps) => <ListItem isCard key={config.name}>
    <ListColumn size="icon cm-status">
        <span title={config.status} className={"cm-status-is-"+config.status}>{config.status === 'active' ? <span>&oplus;</span> : <span>&otimes;</span>}</span>
    </ListColumn>
    <ListColumn size="lg cm-name">
        <button type="button" className="cm-link" onClick={() => onClick(config)}>
            {config.name === "default" ? t(['configs', 'default', 'title']) : config.name}
        </button>
    </ListColumn>
    <ListColumn size="icon">
        <DropdownMenu>
            <MenuItem onClick={() => onConfigAction?.(config, 'activate')}>
                {t(['configs', 'activate'])}
            </MenuItem>
            <MenuItem onClick={() => onConfigAction?.(config, 'deactivate')}>
                {t(['configs', 'deactivate'])}
            </MenuItem>
        </DropdownMenu>
    </ListColumn>
</ListItem>

interface ConfigListProps {
    configs: IDEConfig[];
    onClick: (config: any) => void;
    onConfigAction?: (config: any, action: string) => void;
    t: Translator;
}

const ConfigList = ({ t, configs, onConfigAction, onClick }: ConfigListProps) => {
    const items = configs.map((config) => <ConfigItem onClick={onClick} onConfigAction={onConfigAction} key={config.name} t={t} config={config} />)
    return <List className="cm-config-list">
        <ListHeader>
            <ListColumn size="icon">
                {t(['configs', 'status'])}
            </ListColumn>
            <ListColumn size="lg">
                {t(['configs', 'name'])}
            </ListColumn>
            <ListColumn size="icon">
                {t(['menu'])}
            </ListColumn>
        </ListHeader>

        {items}
    </List>
};

export const Configs = ({ t, configs, onClick, onConfigAction }: ConfigListProps) => {
    return (
        <div className="cm-ide-configs">
            <p className="cm-section-description">
                {t(['configs', 'description'])}
            </p>
            <ConfigList
                t={t}
                configs={configs}
                onConfigAction={onConfigAction}
                onClick={onClick}
            />
        </div>
    );
};
