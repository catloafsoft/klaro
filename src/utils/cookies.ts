export interface KlaroCookie {
    name: string;
    value: string;
}

export function getCookies(): KlaroCookie[] {
    const cookieStrings = document.cookie.split(';');
    const cookies = [];
    const regex = new RegExp('^\\s*([^=]+)\\s*=\\s*(.*?)$');
    for (let i = 0; i < cookieStrings.length; i++) {
        const cookieStr = cookieStrings[i] || '';
        const match = regex.exec(cookieStr);
        if (match === null) continue;
        if (match[1] === undefined || match[2] === undefined) continue;
        cookies.push({
            name: match[1],
            value: match[2],
        });
    }
    return cookies;
}

export function getCookie(name: string): KlaroCookie | null {
    const cookies = getCookies();
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        if (cookie !== undefined && cookie.name === name) return cookie;
    }
    return null;
}

//https://stackoverflow.com/questions/14573223/set-cookie-and-get-cookie-with-javascript
export function setCookie(
    name: string,
    value: string,
    days?: number,
    domain?: string,
    path?: string,
    sameSite?: string,
    secure?: boolean,
): void {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    if (domain !== undefined) {
        expires += '; domain=' + domain;
    }
    if (path !== undefined) {
        expires += '; path=' + path;
    } else {
        expires += '; path=/';
    }
    document.cookie =
        name + '=' + (value || '') + expires + '; SameSite=' + (sameSite || 'Lax') + (secure ? '; Secure' : '');
}

export function deleteCookie(name: string, path?: string, domain?: string): void {
    let str = name + '=; Max-Age=-99999999;';
    // try to delete the cookie without any path and domain
    document.cookie = str;
    str += ' path=' + (path || '/') + ';';
    // try to delete the cookie with path
    document.cookie = str;
    if (domain !== undefined) {
        str += ' domain=' + domain + ';';
        // try to delete the cookie with domain and path
        document.cookie = str;
    }
}
