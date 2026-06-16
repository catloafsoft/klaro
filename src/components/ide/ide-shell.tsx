import React, { useState } from 'react';
import IDE from './ide';

function updateAtPath(target: any, path: (string | number | null)[], value: any, overwrite?: boolean) {
    if (path.length === 0)
        return value;
    const head = path[0];
    const tail = path.slice(1);
    if (head === null || head === undefined)
        return target;
    const next = Array.isArray(target) ? [...target] : {...target};
    next[head] = tail.length === 0 && !overwrite ? value : updateAtPath(next[head] || {}, tail, value, overwrite);
    return next;
}

interface IDEShellProps {
    config: any;
    t: any;
}

const IDEShell = ({ config, t }: IDEShellProps) => {
    const [state, setState] = useState<any>({ activeConfig: config.name || 'default' });
    const [configs, setConfigs] = useState<any[]>([{...config, name: config.name || 'default', status: config.status || 'active'}]);
    const updateConfig = (configName: string, path: (string | number | null)[], value: any, overwrite?: boolean) => {
        setConfigs((current) => current.map((cfg) => (cfg.name === configName ? {...updateAtPath(cfg, path, value, overwrite), modified: true} : cfg)));
    };
    const markSaved = (name: string) => setConfigs((current) => current.map((cfg) => (cfg.name === name ? {...cfg, modified: false} : cfg)));
    return (
        <IDE
            configs={configs}
            resetConfig={markSaved}
            saveConfig={markSaved}
            deleteConfig={() => undefined}
            setState={setState}
            state={state}
            t={t}
            updateConfig={updateConfig}
        />
    );
};

export default IDEShell;
