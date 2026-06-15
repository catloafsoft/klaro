import React, { useCallback, useRef, useState } from 'react';
import ConsentModal from './consent-modal';
import { getPurposes } from '../utils/config';
import Text from './text';
import { asTitle } from '../utils/strings';
import { getPrivacyPolicyUrl } from '../utils/privacy-policy';
import type { BaseComponentProps } from '../types';

interface ConsentNoticeProps extends BaseComponentProps {
    hide: () => void;
    modal?: boolean;
    show: boolean;
    testing?: boolean;
}

const ConsentNotice = ({ lang, config, show, manager, testing, t, modal: modalProp, hide }: ConsentNoticeProps) => {
    const [localModal, setLocalModal] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const noticeRef = useRef<HTMLElement | null>(null);
    const { embedded, noticeAsModal, hideLearnMore } = config;
    const modal = Boolean(modalProp) || localModal;

    const executeButtonClicked = useCallback((setChangedAll: boolean, changedAllValue: boolean, eventType: string) => {
        let changedServices = 0;

        if (setChangedAll)
            changedServices = manager.changeAll(changedAllValue);

        const confirmed = manager.confirmed;
        manager.saveAndApplyConsents(eventType);

        if (setChangedAll && !confirmed && (modal || config.mustConsent)) {
            const close = () => {
                setConfirming(false);
                hide();
            };

            setConfirming(true);
            if (changedServices === 0)
                close();
            else
                setTimeout(close, 800);
        } else {
            hide();
        }
    }, [config.mustConsent, hide, manager, modal]);

    const saveAndHide = useCallback(() => {
        executeButtonClicked(false, false, 'save');
    }, [executeButtonClicked]);

    const acceptAndHide = useCallback(() => {
        executeButtonClicked(true, true, 'accept');
    }, [executeButtonClicked]);

    const declineAndHide = useCallback(() => {
        executeButtonClicked(true, false, 'decline');
    }, [executeButtonClicked]);

    const purposeOrder = config.purposeOrder || [];
    const purposes = getPurposes(config)
        .filter((purpose: string) => purpose !== 'functional')
        .sort((a: string, b: string) => purposeOrder.indexOf(a) - purposeOrder.indexOf(b));
    const purposesTranslations = purposes.map(
        (purpose: string) => t(['!', 'purposes', purpose, 'title?']) || asTitle(purpose),
    );
    const purposesText = purposesTranslations.length === 1
        ? String(purposesTranslations[0])
        : [
            ...purposesTranslations.slice(0, -2),
            purposesTranslations.slice(-2).join(' & '),
        ].join(', ');
    const ppUrl = getPrivacyPolicyUrl(config, lang, t);

    const showModal = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLocalModal(true);
    };

    const hideModal = useCallback(() => {
        if (config.mustConsent && !config.acceptAll)
            return;
        if (manager.confirmed && !testing)
            hide();
        else
            setLocalModal(false);

        setTimeout(() => {
            noticeRef.current?.focus();
        }, 1);
    }, [config.acceptAll, config.mustConsent, hide, manager.confirmed, testing]);

    const changesText = manager.changed ? (
        <p className="cn-changes">
            {t(['consentNotice', 'changeDescription'])}
        </p>
    ) : undefined;

    if (!show && !testing && !confirming)
        return <div />;

    const noticeIsVisible = (!config.mustConsent || noticeAsModal) && !manager.confirmed && !config.noNotice;

    const declineButton = config.hideDeclineAll ? (
        ''
    ) : (
        <button className="cm-btn cm-btn-danger cn-decline" type="button" onClick={declineAndHide}>
            {t(['decline'])}
        </button>
    );

    const acceptButton = config.acceptAll ? (
        <button className="cm-btn cm-btn-success" type="button" onClick={acceptAndHide}>
            {t(['ok'])}
        </button>
    ) : (
        <button className="cm-btn cm-btn-success" type="button" onClick={saveAndHide}>
            {t(['ok'])}
        </button>
    );

    const learnMoreLink = () =>
        (noticeAsModal ? (
            <button
                key="learnMoreLink"
                className="cm-btn cm-btn-lern-more cm-btn-info"
                type="button"
                onClick={showModal}
            >
                {t(['consentNotice', 'learnMore'])}
            </button>
        ) : (
            <button
                key="learnMoreLink"
                className="cm-link cn-learn-more"
                type="button"
                onClick={showModal}
            >
                {t(['consentNotice', 'learnMore'])}
            </button>
        ));

    const ppLink = ppUrl !== undefined ? (
        <a key="ppLink" href={ppUrl}>
            {t(['privacyPolicy', 'name'])}
        </a>
    ) : undefined;

    if (modal || (manager.confirmed && !testing) || (!manager.confirmed && config.mustConsent))
        return (
            <ConsentModal
                t={t}
                lang={lang}
                config={config}
                hide={hideModal}
                confirming={confirming}
                declineAndHide={declineAndHide}
                saveAndHide={saveAndHide}
                acceptAndHide={acceptAndHide}
                manager={manager}
            />
        );

    const noticeBody = (
        <>
            <div className="cn-body">
                {t(['!', 'consentNotice', 'title']) && config.showNoticeTitle && (
                    <h2 id="id-cookie-title">{t(['consentNotice', 'title'])}</h2>
                )}
                <p id="id-cookie-notice">
                    <Text
                        config={config}
                        text={t(['consentNotice', 'description'], {
                            purposes: <strong key="strong">{purposesText}</strong>,
                            privacyPolicy: ppLink,
                            learnMoreLink: learnMoreLink(),
                        })}
                    />
                </p>
                {testing && <p>{t(['consentNotice', 'testing'])}</p>}
                {changesText}
                <div className="cn-ok">
                    {!hideLearnMore && learnMoreLink()}
                    <div className="cn-buttons">
                        {declineButton}
                        {acceptButton}
                    </div>
                </div>
            </div>
        </>
    );

    const noticeClassName = `cookie-notice ${!noticeIsVisible && !testing ? 'cookie-notice-hidden' : ''} ${noticeAsModal ? 'cookie-modal-notice' : ''} ${embedded ? 'cn-embedded' : ''}`;
    const notice = noticeAsModal ? (
        <dialog
            open
            aria-describedby="id-cookie-notice"
            aria-labelledby="id-cookie-title"
            id="klaro-cookie-notice"
            ref={noticeRef as React.RefObject<HTMLDialogElement | null>}
            className={noticeClassName}
        >
            {noticeBody}
        </dialog>
    ) : (
        <section
            aria-describedby="id-cookie-notice"
            aria-labelledby="id-cookie-title"
            id="klaro-cookie-notice"
            tabIndex={-1}
            autoFocus={config.autoFocus}
            ref={noticeRef}
            className={noticeClassName}
        >
            {noticeBody}
        </section>
    );

    if (!noticeAsModal)
        return notice;

    return (
        <div id="cookieScreen" className="cookie-modal">
            <div className="cm-bg" />
            {notice}
        </div>
    );
};

export default ConsentNotice;
