import React, { useCallback, useLayoutEffect, useMemo, useState } from 'react';
import ConsentNotice from './consent-notice';
import type { BaseComponentProps, KlaroWatcher } from '../types';

interface AppProps extends BaseComponentProps {
    modal?: boolean;
    show: number;
    testing?: boolean;
}

const App = ({ config, lang, manager, modal, show, t, testing }: AppProps) => {
    const [, forceUpdate] = useState(0);
    const [hiddenForShow, setHiddenForShow] = useState<number | null>(null);
    useLayoutEffect(() => {
        const watcher: KlaroWatcher = {
            update: (obj, type) => {
                if (obj === manager && type === 'applyConsents') {
                    if (!config.embedded && manager.confirmed)
                        setHiddenForShow(show);
                    else
                        forceUpdate((value) => value + 1);
                }
            },
        };
        manager.watch(watcher);
        return () => manager.unwatch(watcher);
    }, [config.embedded, manager, show]);

    const hide = useCallback(() => {
        if (!config.embedded)
            setHiddenForShow(show);
    }, [config.embedded, show]);

    const className = useMemo(
        () => (config.stylePrefix || 'klaro') + (config.additionalClass !== undefined ? ' ' + config.additionalClass : ''),
        [config.additionalClass, config.stylePrefix],
    );

    return (
        <div lang={lang} className={className}>
            <ConsentNotice
                key={'app-' + show}
                t={t}
                testing={testing}
                show={hiddenForShow !== show && (show > 0 || !manager.confirmed)}
                lang={lang}
                modal={modal}
                hide={hide}
                config={config}
                manager={manager}
            />
        </div>
    );
};

export default App;
