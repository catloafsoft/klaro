import React, { useState, useEffect, useRef } from 'react';
import translations from '../../translations/index';
import { t } from '../../utils/i18n';
import { injectStyles } from '../../utils/styling';
import { themes } from '../../themes';
import { BaseRetractingLabelInput } from './controls';
import App from '../app'
import { convertToMap, update } from '../../utils/maps';
import ConsentManager from '../../consent-manager';
import type { ConsentMap } from '../../types';

class TestStore {
    value: ConsentMap | null;

    constructor(){
        this.value = null
    }

    get() {
        return this.value
    }

    set(value: ConsentMap) {
        this.value = value;
    }

    delete() {
        this.value = null
    }
}

function getTranslations(config: any){
    const trans = new Map();
    update(trans, convertToMap(translations));
    update(trans, convertToMap(config.translations || {}))
    return trans
}

export const Demo = ({t: ttt, config}: any) => {
    const [show, setShow] = useState(0)
    const [siteUrl, setSiteUrl] = useState('')
    const [lang, setLang] = useState(config.languages.length > 0 ? config.languages[0] : 'en')
    const [testStore, setTestStore] = useState(new TestStore())
    const auxiliaryTestStore = new TestStore()
    const manager = new ConsentManager(config, testStore, auxiliaryTestStore);
    const trans = getTranslations(config)
    const tt = (...args: any[]) => t(trans, lang, config.fallbackLang || 'zz', ...args)
    const languages = config.languages.map((language: string) => <option key={language} value={language}>{ttt(['languages', language])} ({language})</option>)
    const testOnSite = () => {
        window.open(siteUrl+`#klaro-testing&klaro-config=${config.name}`)
    }

    const appRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        injectStyles(config, themes, appRef.current)
    })

    return <div className="cm-demo">
        <p className="cm-section-description">
            {ttt(['demo', 'description'])}
        </p>
        <form onSubmit={testOnSite}>
            <div className="cm-config-controls">
                <BaseRetractingLabelInput value={siteUrl} onChange={setSiteUrl} label={ttt(['demo','testOnSite', 'label'])}/>
                <button type="submit" className="cm-control-button cm-success" onClick={(e) => {e.preventDefault();testOnSite()}}>
                    {ttt(['demo', 'testOnSite', 'button'])}
                </button>
            </div>
        </form>
        <div className="cm-config-controls">
            <div className="cm-control">
                <select value={lang} onChange={(e) => setLang(e.target.value)}>
                    {languages}
                </select>
            </div>
            <div className="cm-control">
                <button type="button" className="cm-control-button cm-secondary" onClick={() => {setTestStore(new TestStore());setShow((value) => value + 1);}}>
                    {ttt(['demo', 'reset'])}
                </button>
                <button type="button" className="cm-control-button" onClick={() => {setShow((value) => value + 1)}}>
                    {ttt(['demo', 'showManager'])}
                </button>
            </div>
        </div>
        <div ref={appRef}>
            <App t={tt}
                lang={lang}
                manager={manager as any}
                config={config}
                show={show}
            />
        </div>
    </div>
}
