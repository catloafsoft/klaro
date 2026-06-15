import React, { useEffect, useRef } from 'react';
import { Close } from './icons';
import Services from './services';
import Purposes from './purposes';
import Text from './text';
import { getPrivacyPolicyUrl } from '../utils/privacy-policy';
import type { BaseComponentProps } from '../types';

interface ConsentModalProps extends BaseComponentProps {
    acceptAndHide: () => void;
    confirming: boolean;
    declineAndHide: () => void;
    hide: () => void;
    saveAndHide: () => void;
}

const getFocusableElements = (element: HTMLElement) => Array.from(
    element.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]',
    ),
).filter((el) => el.getAttribute('tabindex') !== '-1');

const ConsentModal = ({
    hide,
    confirming,
    saveAndHide,
    acceptAndHide,
    declineAndHide,
    config,
    manager,
    lang,
    t,
}: ConsentModalProps) => {
    const consentModalRef = useRef<HTMLDialogElement | null>(null);
    const previousActiveElement = useRef<Element | null>(null);
    const { embedded } = config;
    const groupByPurpose = config.groupByPurpose !== undefined ? config.groupByPurpose : true;

    useEffect(() => {
        previousActiveElement.current = document.activeElement;
        const onKeyDown = (e: KeyboardEvent) => {
            const modal = consentModalRef.current;
            if (e.key === 'Escape' && !config.mustConsent) {
                e.preventDefault();
                hide();
                return;
            }
            if (e.key !== 'Tab' || !modal)
                return;
            const focusable = getFocusableElements(modal);
            if (focusable.length === 0)
                return;
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (first === undefined || last === undefined)
                return;
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);
        consentModalRef.current?.focus();
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            const previous = previousActiveElement.current;
            if (previous instanceof HTMLElement)
                previous.focus();
        };
    }, [config.mustConsent, hide]);

    const closeLink = !config.mustConsent ? (
        <button
            title={String(t(['close']))}
            aria-label={String(t(['close']))}
            className="hide"
            type="button"
            onClick={hide}
            tabIndex={0}
        >
            <Close t={t} />
        </button>
    ) : undefined;

    const declineButton = !config.hideDeclineAll && !manager.confirmed ? (
        <button
            disabled={confirming}
            className="cm-btn cm-btn-decline cm-btn-danger cn-decline"
            type="button"
            onClick={declineAndHide}
        >
            {t(['decline'])}
        </button>
    ) : undefined;

    const acceptButton = (
        <button
            disabled={confirming}
            className="cm-btn cm-btn-success cm-btn-info cm-btn-accept"
            type="button"
            onClick={saveAndHide}
        >
            {t([manager.confirmed ? 'save' : 'acceptSelected'])}
        </button>
    );

    const acceptAllButton = config.acceptAll && !manager.confirmed ? (
        <button
            disabled={confirming}
            className="cm-btn cm-btn-success cm-btn-accept-all"
            type="button"
            onClick={acceptAndHide}
        >
            {t(['acceptAll'])}
        </button>
    ) : undefined;

    const ppUrl = getPrivacyPolicyUrl(config, lang, t);
    const ppLink = ppUrl !== undefined ? (
        <a key="ppLink" href={ppUrl} target="_blank" rel="noopener noreferrer">
            {t(['privacyPolicy', 'name'])}
        </a>
    ) : undefined;

    const servicesOrPurposes = groupByPurpose ? (
        <Purposes t={t} config={config} manager={manager} lang={lang} />
    ) : (
        <Services t={t} config={config} manager={manager} lang={lang} />
    );

    const privacyText = ppLink ? [' ', ...([] as React.ReactNode[]).concat(t(['privacyPolicy', 'text'], { privacyPolicy: ppLink }))] : [];
    const innerModal = (
        <dialog
            open
            className="cm-modal cm-klaro"
            aria-modal={!embedded}
            aria-labelledby="klaro-consent-modal-title"
            tabIndex={-1}
            ref={consentModalRef}
        >
            <div className="cm-header">
                {closeLink}
                <h1 className="title" id="klaro-consent-modal-title">
                    <Text config={config} text={t(['consentModal', 'title'])} />
                </h1>
                <p>
                    <Text
                        config={config}
                        text={[t(['consentModal', 'description']), ...privacyText]}
                    />
                </p>
            </div>
            <div className="cm-body">{servicesOrPurposes}</div>
            <div className="cm-footer">
                <div className="cm-footer-buttons">
                    {declineButton}
                    {acceptButton}
                    {acceptAllButton}
                </div>
                {!config.disablePoweredBy && (
                    <p className="cm-powered-by">
                        <a
                            target="_blank"
                            href={config.poweredBy || 'https://kiprotect.com/klaro'}
                            rel="noopener noreferrer"
                        >
                            {t(['poweredBy'])}
                        </a>
                    </p>
                )}
            </div>
        </dialog>
    );

    if (embedded)
        return <div id="cookieScreen" className="cookie-modal cm-embedded">{innerModal}</div>;

    return (
        <div id="cookieScreen" className="cookie-modal">
            <button type="button" className="cm-bg" aria-label={String(t(['close']))} onClick={hide} />
            {innerModal}
        </div>
    );
};

export default ConsentModal;
