import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
    const propsRef = useRef({ config, manager, modal, show });

    propsRef.current = { config, manager, modal, show };

    useEffect(() => {
        const watcher: KlaroWatcher = {
            update: (obj, type) => {
                const current = propsRef.current;
                if (obj === current.manager && type === 'applyConsents') {
                    if (!current.config.embedded && current.manager.confirmed)
                        setHiddenForShow(current.show);
                    else
                        forceUpdate((value) => value + 1);
                }
            },
        };
        manager.watch(watcher);
        return () => manager.unwatch(watcher);
    }, [manager]);

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
