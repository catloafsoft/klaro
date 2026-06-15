import React from 'react';
import { Cookies } from './cookies';
import { I18nInput } from './i18n-input';
import { RetractingLabelInput } from './input';
import { LanguageSelect } from './language-select';
import { PurposeOrder } from './purpose-order';
import { PurposeSelect } from './purpose-select';
import { Range } from './range';
import { Select } from './select';
import { ServiceSelect } from './service-select';
import { Switch } from './switch';
import { ThemesSelect } from './themes-select';

export const controlMap: Record<string, React.ComponentType<any>> = {
    Cookies,
    I18nInput,
    LanguageSelect,
    PurposeOrder,
    PurposeSelect,
    Range,
    RetractingLabelInput,
    Select,
    ServiceSelect,
    Switch,
    ThemesSelect,
};
