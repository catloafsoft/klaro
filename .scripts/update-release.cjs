const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const YAML = require('yaml');

const root = path.resolve(__dirname, '..');
const version = require('../package.json').version;
const yamlPath = path.join(root, 'releases.yml');
const jsonPath = path.join(root, 'releases.json');
const yaml = fs.readFileSync(yamlPath, 'utf8');
const doc = YAML.parseDocument(yaml);
if (doc.errors.length > 0)
    throw doc.errors[0];
if (doc.getIn([0, 'version']) !== version)
    throw new Error(`Add a release entry for ${version} to releases.yml first.`);

const dist = path.join(root, 'dist');
const files = fs.readdirSync(dist)
    .filter(name => /\.(css|js)$/.test(name) && name !== 'config.js')
    .sort()
    .map(name => ({
        name,
        sha384: crypto.createHash('sha384').update(fs.readFileSync(path.join(dist, name))).digest('base64'),
    }));
doc.setIn([0, 'files'], files);
const json = JSON.stringify(doc.toJS(), null, 2) + '\n';

if (process.argv.includes('--check')) {
    if (fs.readFileSync(jsonPath, 'utf8') !== json)
        throw new Error('Release metadata is stale. Run pnpm run release-metadata after building all bundles.');
    const recordedFiles = YAML.parse(fs.readFileSync(yamlPath, 'utf8'))[0].files;
    if (JSON.stringify(recordedFiles) !== JSON.stringify(files))
        throw new Error('Release YAML hashes do not match dist. Run pnpm run release-metadata.');
} else {
    // Preserve historical release records and their original formatting.
    const nextRelease = yaml.indexOf('\n- changelog:', 1);
    const currentRelease = YAML.parseDocument(nextRelease === -1 ? yaml : yaml.slice(0, nextRelease + 1));
    currentRelease.setIn([0, 'files'], files);
    fs.writeFileSync(yamlPath, currentRelease.toString({ lineWidth: 0 }) + (nextRelease === -1 ? '' : yaml.slice(nextRelease + 1)));
    fs.writeFileSync(jsonPath, json);
}
