/* eslint-disable no-console */
import { familySync } from 'detect-libc';
import { getAbi } from 'node-abi';
import { arch as _arch, platform as _platform } from 'node:os';
import { join, resolve } from 'node:path';
import { env, versions } from 'node:process';
import { threadId } from 'node:worker_threads';

import type {
  PrivateV8CpuProfilerBindings,
  ProfileFormat,
  RawChunkCpuProfile,
  RawThreadCpuProfile,
  V8CpuProfilerBindings,
} from './types';

const stdlib = familySync();
const platform = process.env['BUILD_PLATFORM'] || _platform();
const arch = process.env['BUILD_ARCH'] || _arch();
const abi = getAbi(versions.node, 'node');
const identifier = [platform, arch, stdlib, abi].filter(c => c !== undefined && c !== null).join('-');

/**
 *  Imports cpp bindings based on the current platform and architecture.
 */
// eslint-disable-next-line complexity
export function importCppBindingsModule(): PrivateV8CpuProfilerBindings {
  // If a binary path is specified, use that.
  if (env['SENTRY_PROFILER_BINARY_PATH']) {
    const envPath = env['SENTRY_PROFILER_BINARY_PATH'];
    return require(envPath);
  }

  // If a user specifies a different binary dir, they are in control of the binaries being moved there
  if (env['SENTRY_PROFILER_BINARY_DIR']) {
    const binaryPath = join(resolve(env['SENTRY_PROFILER_BINARY_DIR']), `sentry_cpu_profiler-${identifier}.node`);
    return require(binaryPath);
  }

  if (process.versions.electron) {
    try {
      return require('../build/Release/sentry_cpu_profiler.node');
    } catch (e) {
      console.warn(`The '@sentry/profiling-node' binary could not be found. Use '@electron/rebuild' to ensure the native module is built for Electron.`);
      throw e;
    }
  }

  // We need the fallthrough so that in the end, we can fallback to the dynamic require.
  // This is for cases where precompiled binaries were not provided, but may have been compiled from source.
  if (platform === 'darwin') {
    if (arch === 'x64') {
      if (abi === '108') {
        return require('./sentry_cpu_profiler-darwin-x64-108.node');
      }
      if (abi === '115') {
        return require('./sentry_cpu_profiler-darwin-x64-115.node');
      }
      if (abi === '127') {
        return require('./sentry_cpu_profiler-darwin-x64-127.node');
      }
    }

    if (arch === 'arm64') {
      if (abi === '108') {
        return require('./sentry_cpu_profiler-darwin-arm64-108.node');
      }
      if (abi === '115') {
        return require('./sentry_cpu_profiler-darwin-arm64-115.node');
      }
      if (abi === '127') {
        return require('./sentry_cpu_profiler-darwin-arm64-127.node');
      }
    }
  }

  if (platform === 'win32') {
    if (arch === 'x64') {
      if (abi === '108') {
        return require('./sentry_cpu_profiler-win32-x64-108.node');
      }
      if (abi === '115') {
        return require('./sentry_cpu_profiler-win32-x64-115.node');
      }
      if (abi === '127') {
        return require('./sentry_cpu_profiler-win32-x64-127.node');
      }
    }
  }

  if (platform === 'linux') {
    if (arch === 'x64') {
      if (stdlib === 'musl') {
        if (abi === '108') {
          return require('./sentry_cpu_profiler-linux-x64-musl-108.node');
        }
        if (abi === '115') {
          return require('./sentry_cpu_profiler-linux-x64-musl-115.node');
        }
        if (abi === '127') {
          return require('./sentry_cpu_profiler-linux-x64-musl-127.node');
        }
      }
      if (stdlib === 'glibc') {
        if (abi === '108') {
          return require('./sentry_cpu_profiler-linux-x64-glibc-108.node');
        }
        if (abi === '115') {
          return require('./sentry_cpu_profiler-linux-x64-glibc-115.node');
        }
        if (abi === '127') {
          return require('./sentry_cpu_profiler-linux-x64-glibc-127.node');
        }
      }
    }
    if (arch === 'arm64') {
      if (stdlib === 'musl') {
        if (abi === '108') {
          return require('./sentry_cpu_profiler-linux-arm64-musl-108.node');
        }
        if (abi === '115') {
          return require('./sentry_cpu_profiler-linux-arm64-musl-115.node');
        }
        if (abi === '127') {
          return require('./sentry_cpu_profiler-linux-arm64-musl-127.node');
        }
      }

      if (stdlib === 'glibc') {
        if (abi === '108') {
          return require('./sentry_cpu_profiler-linux-arm64-glibc-108.node');
        }
        if (abi === '115') {
          return require('./sentry_cpu_profiler-linux-arm64-glibc-115.node');
        }
        if (abi === '127') {
          return require('./sentry_cpu_profiler-linux-arm64-glibc-127.node');
        }
      }
    }
  }

  return require(`./sentry_cpu_profiler-${identifier}.node`);
}

export const PrivateCpuProfilerBindings: PrivateV8CpuProfilerBindings = importCppBindingsModule();

class Bindings implements V8CpuProfilerBindings {
  public startProfiling(name: string): void {
    if (!PrivateCpuProfilerBindings) {
      console.log('[Profiling] Bindings not loaded, ignoring call to startProfiling.');
      return;
    }

    if (typeof PrivateCpuProfilerBindings.startProfiling !== 'function') {
      console.log('[Profiling] Native startProfiling function is not available, ignoring call to startProfiling.');
      return;
    }

    return PrivateCpuProfilerBindings.startProfiling(name);
  }

  public stopProfiling(name: string, format: ProfileFormat.THREAD): RawThreadCpuProfile | null;
  public stopProfiling(name: string, format: ProfileFormat.CHUNK): RawChunkCpuProfile | null;
  public stopProfiling(
    name: string,
    format: ProfileFormat.CHUNK | ProfileFormat.THREAD,
  ): RawThreadCpuProfile | RawChunkCpuProfile | null {
    if (!PrivateCpuProfilerBindings) {
      console.log('[Profiling] Bindings not loaded or profile was never started, ignoring call to stopProfiling.');
      return null;
    }

    if (typeof PrivateCpuProfilerBindings.stopProfiling !== 'function') {
      console.log('[Profiling] Native stopProfiling function is not available, ignoring call to stopProfiling.');
      return null;
    }

    return PrivateCpuProfilerBindings.stopProfiling(
      name,
      format as unknown as number,
      threadId,
      !!global._sentryDebugIds,
    );
  }
}

export const CpuProfilerBindings = new Bindings();

export * from './types';
