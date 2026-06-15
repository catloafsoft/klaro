export function getPurposes(config: any): string[] {
    const purposes = new Set<string>();
    for (let i = 0; i < config.services.length; i++) {
        const servicePurposes = config.services[i].purposes || [];
        for (let j = 0; j < servicePurposes.length; j++)
            purposes.add(servicePurposes[j]);
    }
    return Array.from(purposes);
}

export function update(ed: Record<string, any>, d: Record<string, any>, overwrite = true): Record<string, any> {
    const keys = Object.keys(d);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (key === undefined)
            continue;
        const vd = d[key];
        const ved = ed[key];
        if (typeof vd === 'string') {
            if (overwrite || ved === undefined) ed[key] = vd;
        } else if (typeof vd === 'object') {
            if (typeof ved === 'object') {
                update(ved, vd, overwrite);
            } else if (overwrite || ved === undefined) {
                ed[key] = vd;
            }
        }
    }
    return ed;
}
