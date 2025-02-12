// eslint-disable-next-line import/no-unresolved
import esbuild from 'esbuild';
import * as path from 'path';
import { describe, expect, test } from "vitest";
// eslint-disable-next-line import/no-unresolved
import webpack from 'webpack';

const entry = path.resolve(__dirname, 'bundle.mjs');

describe('Bundler tests', () => {
  test('webpack', ({ skip }) => {
    if (!process.env.CI) {
      skip("Modules will be missing unless we're running in CI");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      webpack({
        mode: 'production',
        entry: entry,
        target: 'node',
        output: {
          path: path.resolve(__dirname, 'dist', 'webpack'),
          filename: 'index.js',
        },
        resolve: {
          extensions: ['.js', '.node'],
        },
        module: {
          rules: [
            {
              test: /\.node$/,
              loader: require.resolve('node-loader'),
            },
          ],
        },
      }).run((err, stats) => {
        try {
          expect(err).toBeNull();
          expect(stats?.compilation.errors.length).toBe(0);
          resolve();
        } catch (e) {
          console.error(stats?.compilation.errors);
          reject(e);
        }
      });
    });
  });

  test('esbuild', ({ skip }) => {
    if (!process.env.CI) {
      skip("Modules will be missing unless we're running in CI");
      return;
    }

    esbuild.buildSync({
      platform: 'node',
      entryPoints: [entry],
      outfile: './dist/esbuild/esm/index.mjs',
      target: 'esnext',
      format: 'esm',
      bundle: true,
      loader: { '.node': 'copy' },
   });
  });
});
