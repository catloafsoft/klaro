import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const browserGlobals = {
    ...globals.browser,
    ...globals.es2022,
    __webpack_public_path__: 'writable',
    module: 'readonly',
    require: 'readonly',
    VERSION: 'readonly',
};

const sharedPlugins = {
    '@stylistic': stylistic,
    react: reactPlugin,
};

const sharedSettings = {
    react: {
        version: '18.0',
    },
};

const sharedRules = {
    ...js.configs.recommended.rules,
    ...reactPlugin.configs.recommended.rules,
    eqeqeq: 'error',
    '@stylistic/indent': ['error', 4, { SwitchCase: 1 }],
    '@stylistic/linebreak-style': ['error', 'unix'],
    '@stylistic/no-confusing-arrow': 'error',
    '@stylistic/no-trailing-spaces': 'error',
    '@stylistic/eol-last': ['error', 'always'],
    'no-alert': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-implied-eval': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-new-wrappers': 'error',
    'no-throw-literal': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    yoda: 'error',
    'react/default-props-match-prop-types': 'error',
    'react/forbid-foreign-prop-types': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-string-refs': 'warn',
    'react/no-unused-prop-types': 'error',
    'react/prop-types': 'off',
    'react/sort-prop-types': ['error', { callbacksLast: true }],
};

export default [
    {
        ignores: [
            'dist/**',
            'node_modules/**',
            'coverage/**',
            'examples/klaro-and-webpack/dist/**',
        ],
    },
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: browserGlobals,
        },
        plugins: sharedPlugins,
        settings: sharedSettings,
        rules: sharedRules,
    },
    {
        files: ['src/**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            parser: tseslint.parser,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: browserGlobals,
        },
        plugins: {
            ...sharedPlugins,
            '@typescript-eslint': tseslint.plugin,
        },
        settings: sharedSettings,
        rules: {
            ...sharedRules,
            'no-undef': 'off',
            'no-unused-vars': 'off',
            'react/no-unused-prop-types': 'off',
            '@typescript-eslint/no-unused-vars': ['error', {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
            }],
        },
    },
];
