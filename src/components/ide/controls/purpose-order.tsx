import React from "react";
import { getValue, getFallbackValue } from '../utils/i18n';

export const PurposeOrder = ({t, config, updateConfig}: any) => {
    const purposes = new Set<string>()
    const purposeOrder = config.purposeOrder || []
    config.services.forEach((service: any) => service.purposes.forEach((purpose: string) => purposes.add(purpose)))
    const sortedPurposes = Array.from(purposes.values()).sort((a,b) => purposeOrder.indexOf(a)-purposeOrder.indexOf(b))
    purposes.forEach(purpose => {
        if (purposeOrder.indexOf(purpose) === -1)
            purposeOrder.push(purpose)
    })
    const move = (purpose: string, di: number) => {
        const i = purposeOrder.indexOf(purpose)
        const newPurposeOrder = [...purposeOrder]
        if ((i === 0 && di === -1) || (i === purposeOrder.length-1 && di === 1))
            return
        const p = newPurposeOrder[i+di]
        newPurposeOrder[i+di] = purpose
        newPurposeOrder[i] = p
        updateConfig(["purposeOrder"], newPurposeOrder)
    }
    const purposeItems = sortedPurposes.map((purpose) => {
        const value = getValue(config.translations, t.lang, ['purposes', purpose, 'title'])
        const fallbackValue = getFallbackValue(t.tv , t.lang, ['purposes', purpose, 'title'])
        return <li key={purpose}>
            <span className="cm-buttons">
                <a className="cm-btn" onClick={() => move(purpose, -1)}>&uarr;</a>
                <a className="cm-btn" onClick={() => move(purpose, 1)}>&darr;</a>
            </span>
            <span className="cm-value">
                {value || fallbackValue || purpose}
            </span>
        </li>
    })
    return <div className="cm-purpose-order">
        <h3>{t(['purposeOrder', 'title'])}</h3>
        <p className="cm-description">
            {t(['purposeOrder', 'description'])}
        </p>
        <ul>
            {purposeItems}
        </ul>
    </div>
}
