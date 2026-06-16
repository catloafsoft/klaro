const webpack = require('webpack');
const path = require('path');
const SRC_DIR = path.resolve(__dirname, 'src');
const WATCH_IGNORED = /[/\\](?:\.git|\.pnpm-store|node_modules)[/\\]/;
const MASKED_EXTENSION_URL = 'webkit-masked-url://hidden/';

function shouldShowRuntimeError(error) {
    const message = String(error?.message || error || '');
    const stack = String(error?.stack || '');

    if (stack.includes(MASKED_EXTENSION_URL)) {
        return false;
    }

    if (message === 'TimeoutError: operation timed out') {
        return false;
    }

    if (message === 'Unknown promise rejection reason') {
        return false;
    }

    return true;
}

module.exports = {
    mode: 'development',
    devtool: 'inline-source-map',
    optimization: {
        minimize: false,
    },
    watchOptions: {
        ignored: WATCH_IGNORED,
        poll: 1000,
    },
    plugins: [
        new webpack.DefinePlugin({
            VERSION: JSON.stringify('development'),
        })
    ],
    devServer: {
        hot: true,
        static: {
            directory: path.join(__dirname, 'dist'),
            watch: {
                ignored: WATCH_IGNORED,
                usePolling: true,
                interval: 1000,
            },
        },
        historyApiFallback: true,
        client: {
            overlay: {
                errors: true,
                warnings: false,
                runtimeErrors: shouldShowRuntimeError,
            },
        },
        proxy: [
            {
                context: ['/api'],
                target: 'http://localhost:5000',
                secure: false,
            },
        ],
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
            'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
        },
        allowedHosts: 'all',
    }
};
