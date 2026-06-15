import type { KlaroConfig, Translator } from '../types';

export function getPrivacyPolicyUrl(config: KlaroConfig, lang: string, t: Translator): string | undefined {
    if (config.privacyPolicy !== undefined) {
        if (typeof config.privacyPolicy === 'string')
            return config.privacyPolicy;
        if (typeof config.privacyPolicy === 'object')
            return config.privacyPolicy[lang] || config.privacyPolicy.default;
    }
    const ppUrl = t(['!', 'privacyPolicyUrl'], { lang: lang });
    if (Array.isArray(ppUrl))
        return ppUrl.join('');
    return typeof ppUrl === 'string' ? ppUrl : undefined;
}
