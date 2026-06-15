import { version } from './version';

export default class KlaroApi {
    constructor(url, id, opts) {
        this.url = url;
        this.id = id;
        this.opts = Object.assign({}, opts);
    }

    getLocationData(config) {
        const recordsConfig = config.records || {};
        const savePathname =
            recordsConfig.savePathname !== undefined
                ? recordsConfig.savePathname
                : true;
        return {
            pathname: savePathname ? location.pathname : undefined,
            port: location.port !== '' ? parseInt(location.port) : 0,
            hostname: location.hostname,
            protocol: location.protocol.slice(0, location.protocol.length - 1),
        };
    }

    getUserData() {
        return {
            client_version: version(),
            client_name: 'klaro:web',
        };
    }

    getBaseConsentData(config) {
        return {
            location_data: this.getLocationData(config),
            user_data: this.getUserData(config),
        };
    }

    // fallow-ignore-next-line unused-class-member
    update(notifier, name, data) {
        if (name === 'saveConsents') {
            if (data.type === 'save' && Object.keys(data.changes).length === 0)
                return; // save event with no changes
            const consentData = {
                ...this.getBaseConsentData(notifier.config),
                consent_data: {
                    consents: data.consents,
                    changes: data.type === 'save' ? data.changes : undefined,
                    type: data.type,
                    config: notifier.config.id,
                },
            };
            this.submitConsentData(consentData);
        } else if (name === 'showNotice') {
            const consentData = {
                ...this.getBaseConsentData(data.config),
                consent_data: {
                    consents: {},
                    changes: {},
                    type: 'show',
                    config: data.config.id,
                },
            };
            this.submitConsentData(consentData);
        }
    }

    apiRequest(type, path, data, contentType) {
        let body;
        let url = this.url + path;

        if (data !== undefined) {
            if (type === 'GET') {
                const query = new URLSearchParams(
                    Object.entries(data).filter(([, value]) => value !== undefined)
                ).toString();
                if (query !== '')
                    url += (url.indexOf('?') === -1 ? '?' : '&') + query;
            } else {
                body = JSON.stringify(data);
            }
        }

        const headers = {};
        if (body !== undefined)
            headers['Content-Type'] = contentType || 'application/json;charset=UTF-8';

        return fetch(url, { method: type, headers: headers, body: body })
            .then((response) => response.text().then((text) => {
                let responseData = {};
                if (text !== '')
                    responseData = JSON.parse(text);
                if (response.status < 200 || response.status >= 300) {
                    responseData.status = response.status;
                    throw Object.assign(new Error('Klaro API request failed'), responseData);
                }
                return responseData;
            }))
            .catch((err) => {
                if (err.status !== undefined)
                    throw err;
                throw Object.assign(new Error('Klaro API request failed'), { status: 0, error: err });
            });
    }

    submitConsentData(consentData) {
        return this.apiRequest(
            'POST',
            '/v1/privacy-managers/' + this.id + '/submit',
            consentData,
            'text/plain;charset=UTF-8'
        );
    }

    /*
    Load a specific Klaro config from the API.
    */
    loadConfig(name) {
        return this.apiRequest(
            'GET',
            '/v1/privacy-managers/' + this.id + '/config.json',
            { name: name, testing: this.opts.testing || undefined }
        );
    }

}
