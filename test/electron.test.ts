import { execSync, spawnSync,  } from 'child_process';
import { default as getElectronPath } from 'electron';
import { describe, expect, test } from "vitest";

describe('Electron', () => {
  test('should work', () => {
    execSync('yarn rebuild', { cwd: __dirname });

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - The Electron types don't detail the default export outside
    // of an Electron process.
    const result = spawnSync(getElectronPath, [__dirname]);
    expect(result.status).toBe(0);
  });
});
