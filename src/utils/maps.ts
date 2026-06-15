export function convertToMap(d: Record<string, any>): Map<string, any> {
    const dm = new Map<string, any>();
    for (const key of Object.keys(d)) {
        const value = d[key];
        if (!(typeof key === 'string')) continue;
        if (typeof value === 'string' || value === null) {
            dm.set(key, value);
        } else {
            dm.set(key, convertToMap(value));
        }
    }
    return dm;
}

export function update(d: Map<any, any>, ed: Map<any, any>, overwrite = true, clone = false): Map<any, any> {
    const assign = (target: Map<any, any>, key: any, value: any) => {
        if (value instanceof Map) {
            const map = new Map<any, any>();
            //we deep-clone the map
            update(map, value, true, false);
            target.set(key, map);
        } else target.set(key, value);
    };

    if (!(ed instanceof Map) || !(d instanceof Map))
        throw new Error('Parameters are not maps!');
    if (clone) d = new Map(d);
    for (const key of ed.keys()) {
        const value = ed.get(key);
        const dvalue = d.get(key);
        if (!d.has(key)) {
            assign(d, key, value);
        } else if (value instanceof Map && dvalue instanceof Map) {
            d.set(key, update(dvalue, value, overwrite, clone));
        } else {
            if (!overwrite) continue;
            assign(d, key, value);
        }
    }
    return d;
}
