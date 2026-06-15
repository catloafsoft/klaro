import React from 'react';
import translations from '../../translations/index';
import { Tabs, Tab } from './tabs';
import { BaseRetractingLabelInput } from './controls/input';
import { getValue, getFallbackValue } from './utils/i18n'

interface TranslationsForKeyProps {
    fallbackValue?: string;
    hintKey: string[];
    languages: string[];
    name: string;
    noDefault?: boolean;
    onChange: (language: string, value: string | undefined) => void;
    t: any;
    translationKey: string[];
    translations: any;
    value?: string;
}

const TranslationsForKey = ({hintKey, translationKey, noDefault, onChange, name, translations, languages, t}: TranslationsForKeyProps) => {
    /*
    Here we list the different translations
    */
    const allLanguages = [...(noDefault ? [] : ['zz']),...languages]
    const description = t(['translations', ...hintKey, 'description'], {name: name})
    const items = allLanguages.map(language => {
        const value = getValue(translations, language, translationKey)
        const fallbackValue = getFallbackValue(t.tv , language, translationKey)
        const isDefault = (value && value === fallbackValue) || ((!value) && fallbackValue !== undefined)
        const changeValue = (v: string) => {
            if (v === fallbackValue || v === ''){
                onChange(language, undefined)
            }
            else
                onChange(language, v)
        }
        const label = t(['translations', ...hintKey, language === 'zz' ? 'defaultLabel' : 'label'], {name: name, language: t(['languages', language])})
        return <li key={language}>
            <span className="cm-lang">{language !== 'zz' ? language : '_'}</span>
            <BaseRetractingLabelInput
                onChange={changeValue}
                label={[...([] as React.ReactNode[]).concat(label), ...(isDefault ? [' ', ...([] as React.ReactNode[]).concat(t(['translations', 'defaultValue']))] : [])]}
                value={value || fallbackValue || ''}
            />
        </li>
    })
    return <div className="cm-translations-for-key">
        <h4>{t(['translations', ...hintKey, 'label'], {name: name})}</h4>
        <p>
            {description}
        </p>
        <ul>
            {items}
        </ul>
    </div>
}

const ServiceTranslations = ({t, config, updateConfig}: any) => {
    const updateDescription = (service: any, language: string, value: string | undefined) => {
        updateConfig(['services', service._id, 'translations', language, 'description'], value)
    }
    const updateTitle = (service: any, language: string, value: string | undefined) => {
        updateConfig(['services', service._id, 'translations', language, 'title'], value)
    }
    const serviceTranslations = config.services.map((service: any) => <React.Fragment key={service.name}>
        <h3>{service.name}</h3>
        <TranslationsForKey
            onChange={(language: string, value: string | undefined) => updateTitle(service, language, value)}
            t={t}
            hintKey={['services', 'title']}
            translationKey={['title']}
            name={service.name}
            translations={service.translations || {}}
            languages={config.languages} />
        <TranslationsForKey
            onChange={(language: string, value: string | undefined) => updateDescription(service, language, value)}
            t={t}
            hintKey={['services', 'description']}
            translationKey={['description']}
            name={service.name}
            translations={service.translations || {}}
            noDefault
            languages={config.languages} />
    </React.Fragment>)
    return <React.Fragment>
        {
            serviceTranslations.length > 0 && serviceTranslations || <p className="cm-section-description">
                {t(['translations', 'noTranslations'])}
            </p>
        }
    </React.Fragment>

}

const PurposeTranslations = ({t, config, updateConfig}: any) => {
    const purposes = new Set<string>()
    config.services.forEach((service: any) => service.purposes.forEach((purpose: string) => purposes.add(purpose)))
    const updateDescription = (purpose: string, language: string, value: string | undefined) => {
        updateConfig(['translations', language, 'purposes', purpose, 'description'], value)
    }
    const updateTitle = (purpose: string, language: string, value: string | undefined) => {
        updateConfig(['translations', language, 'purposes', purpose, 'title'], value)
    }
    const purposeTranslations = Array.from(purposes.keys()).map(purpose => <React.Fragment key={purpose}>
        <h3>{purpose}</h3>
        <TranslationsForKey
            t={t}
            onChange={(language: string, value: string | undefined) => updateTitle(purpose, language, value)}
            translationKey={['purposes', purpose, 'title']}
            hintKey={['purposes', 'title']}
            name={purpose}
            translations={config.translations}
            languages={config.languages} />
        <TranslationsForKey
            t={t}
            onChange={(language: string, value: string | undefined) => updateDescription(purpose, language, value)}
            hintKey={['purposes', 'description']}
            translationKey={['purposes', purpose, 'description']}
            name={purpose}
            translations={config.translations}
            noDefault
            languages={config.languages} />
    </React.Fragment>)
    return <React.Fragment>
        {
            purposeTranslations.length > 0 && purposeTranslations || <p className="cm-section-description">
                {t(['translations', 'noTranslations'])}
            </p>
        }
    </React.Fragment>
}

const PrivacyPolicyUrlTranslations = ({t, config, updateConfig}: any) => {
    const updateUrl = (language: string, value: string | undefined) => {
        updateConfig(['translations', language, 'privacyPolicyUrl'], value)
    }
    return <TranslationsForKey
        t={t}
        hintKey={['privacyPolicyUrl']}
        name="privacyPolicyUrl"
        translationKey={['privacyPolicyUrl']}
        translations={config.translations}
        languages={config.languages}
        onChange={updateUrl} />

}


const UITranslations = ({t, config, updateConfig}: any) => {

    const translationsFor = (translations: Record<string, any>, parentKey: string[]): React.ReactNode => {
        const items: React.ReactNode[] = []
        for(const [k, v] of Object.entries(translations)){

            // we skip the purposes and services sections as they are covered
            // by other translation dialogs
            if (parentKey.length === 0 && (k === "purposes" || k === "services"))
                continue

            let content
            const key = [...parentKey, k]
            if (typeof v === "object"){
                content = translationsFor(v, key)
            } else {
                content = <TranslationsForKey
                    onChange={(language: string, value: string | undefined) => updateConfig(["translations", language, ...key], value, true)}
                    t={t}
                    hintKey={key}
                    noDefault={true}
                    translationKey={key}
                    name={key.join(".")}
                    key={key.join(".")}
                    translations={config.translations}
                    languages={config.languages} />
            }
            items.push(<div key={key.join(".")} className="cm-key-translations">
                {content}
            </div>)
        }
        return <React.Fragment>
            {items}
        </React.Fragment>
    }

    return translationsFor(translations.en, [])

}

const components: Record<string, React.ComponentType<any>> = {
    services: ServiceTranslations,
    purposes: PurposeTranslations,
    privacyPolicyUrl : PrivacyPolicyUrlTranslations,
    ui: UITranslations,
}

export const Translations = ({t, state, setState, config, updateConfig}: any) => {
    /*
    - We just show the hiearchy of translation values in the reference translations.
    - We need translations for the privacyUrl, the services and the purposes.
    */
    state = state || {tab: 'services'}
    const Component = components[state.tab]
    if (Component === undefined)
        return null;
    const tabs = Array.from(Object.entries(components)).map(([k]) => <Tab active={k === state.tab} onClick={() => setState({tab: k})} key={k}>{t(['translations', 'headers', k])}</Tab>)
    return <React.Fragment>
        <p className="cm-section-description">
            {t(['translations', 'description'])}
        </p>
        <Tabs>
            {tabs}
        </Tabs>
        <div className="cm-translations-fields">
            <Component t={t} config={config} updateConfig={updateConfig} />
        </div>
    </React.Fragment>
}
