import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            react: 'preact/compat',
            'react/jsx-runtime': 'preact/jsx-runtime',
            'react-dom/client': 'preact/compat/client',
            'react-dom': 'preact/compat',
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./test/setup.js'],
    },
});
