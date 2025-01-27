/**
 * We install the tarball in this directory to test the package.
 */
const { execSync, spawnSync } = require('node:child_process');
const { rmSync, writeFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const pkgJson = require('../package.json');
const normalizedName = pkgJson.name.replace('@', '').replace('/', '-');

const tarball = join(__dirname, '..', `${normalizedName}-${pkgJson.version}.tgz`);

if (!existsSync(tarball)) {
  console.error(`Tarball not found: '${tarball}'`);
  console.error(`Run 'yarn build && yarn build:tarball' first`);
  process.exit(1);
}

console.log('Clearing node_modules...');
rmSync(join(__dirname, 'node_modules'), { recursive: true, force: true });
console.log('Clearing yarn.lock...');
rmSync(join(__dirname, 'yarn.lock'), { force: true });

console.log('Clearing yarn cache...');
spawnSync(`yarn cache clean ${pkgJson.name}`, { shell: true, stdio: 'inherit' });
// Yarn has a bug where 'yarn cache clean X' does not remove the temp directory where the tgz is unpacked to.
// This means installing from local tgz does not update when src changes are made https://github.com/yarnpkg/yarn/issues/5357
const dirResult = spawnSync('yarn cache dir', { shell: true });
const tmpDir = join(dirResult.output.toString().replace(/[,\n\r]/g, ''), '.tmp');
rmSync(tmpDir, { recursive: true, force: true });

console.log('Writing package.json...');
writeFileSync(join(__dirname, 'package.json'), `{
      "name": "node-cpu-profiler-test",
      "license": "MIT",
      "dependencies": {
        "@sentry-internal/node-cpu-profiler": "file:../${normalizedName}-${pkgJson.version}.tgz"
      }
    }`);

console.log('Installing dependencies...');
execSync('yarn install', { cwd: __dirname });
