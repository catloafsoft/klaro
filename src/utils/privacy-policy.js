export function getPrivacyPolicyUrl(config, lang, t) {
    if (config.privacyPolicy !== undefined) {
        if (typeof config.privacyPolicy === 'string')
            return config.privacyPolicy;
        if (typeof config.privacyPolicy === 'object')
            return config.privacyPolicy[lang] || config.privacyPolicy.default;
    }
    const ppUrl = t(['!', 'privacyPolicyUrl'], { lang: lang });
    if (Array.isArray(ppUrl))
        return ppUrl.join('');
    return ppUrl;
}
