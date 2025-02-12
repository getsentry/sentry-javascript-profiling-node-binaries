import type { SpawnSyncReturns } from 'child_process';
import { execSync, spawnSync } from 'child_process';
// eslint-disable-next-line import/no-unresolved
import { default as getElectronPath } from 'electron';
import { describe, expect, test } from "vitest";

function runElectron(): SpawnSyncReturns<Buffer> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - The Electron types don't detail the default export outside
  // of an Electron process.
  return spawnSync(getElectronPath, [__dirname]);
}

describe('Electron', () => {

  test('should work', () => {
    const result1 = runElectron();

    expect(result1.stderr.toString()).toContain('binary could not be found')
    expect(result1.status).toBe(1);

    execSync('yarn rebuild', { cwd: __dirname });

    const result2 = runElectron();
    expect(result2.status).toBe(0);
  });
});
