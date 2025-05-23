// eslint-disable-next-line import/no-unresolved
import type { RawChunkCpuProfile, RawThreadCpuProfile } from '@sentry-internal/node-cpu-profiler';
// eslint-disable-next-line import/no-unresolved
import { CpuProfilerBindings, PrivateCpuProfilerBindings,ProfileFormat } from '@sentry-internal/node-cpu-profiler';
import { describe, expect,test } from 'vitest';

function fail(message: string): never {
  throw new Error(message);
}

const fibonacci = (n: number): number => {
  if (n <= 1) {
    return n;
  }
  return fibonacci(n - 1) + fibonacci(n - 2);
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const profiled = async (name: string, fn: () => void) => {
  CpuProfilerBindings.startProfiling(name);
  await fn();
  return CpuProfilerBindings.stopProfiling(name, ProfileFormat.THREAD);
};

const assertValidSamplesAndStacks = (
  stacks: RawChunkCpuProfile['stacks'],
  samples: RawChunkCpuProfile['samples'] | RawThreadCpuProfile['samples'],
) => {
  expect(stacks.length).toBeGreaterThan(0);
  expect(samples.length).toBeGreaterThan(0);
  expect(stacks.length <= samples.length).toBe(true);

  for (const sample of samples) {
    if (sample.stack_id === undefined) {
      throw new Error(`Sample ${JSON.stringify(sample)} has not stack id associated`);
    }
    if (!stacks[sample.stack_id]) {
      throw new Error(`Failed to find stack for sample: ${JSON.stringify(sample)}`);
    }
    expect(stacks[sample.stack_id]).not.toBe(undefined);
  }

  for (const stack of stacks) {
    expect(stack).not.toBe(undefined);
  }
};

const isValidMeasurementValue = (v: any) => {
  if (isNaN(v)) return false;
  return typeof v === 'number' && v > 0;
};

const assertValidMeasurements = (measurement: RawThreadCpuProfile['measurements']['memory_footprint'] | undefined) => {
  if (!measurement) {
    throw new Error('Measurement is undefined');
  }
  expect(measurement).not.toBe(undefined);
  expect(typeof measurement.unit).toBe('string');
  expect(measurement.unit.length).toBeGreaterThan(0);

  for (let i = 0; i < measurement.values.length; i++) {
    expect(measurement?.values?.[i]?.elapsed_since_start_ns).toBeGreaterThan(0);
    expect(measurement?.values?.[i]?.value).toBeGreaterThan(0);
  }
};

describe('Bindings', () => {
  describe('Private bindings', () => {
    test('does not crash if collect resources is false', async () => {
      PrivateCpuProfilerBindings.startProfiling!('profiled-program');
      await wait(100);
      expect(() => {
        const profile = PrivateCpuProfilerBindings.stopProfiling!('profiled-program', 0, 0, false);
        if (!profile) throw new Error('No profile');
      }).not.toThrow();
    });

    test('throws if invalid format is supplied', async () => {
      PrivateCpuProfilerBindings.startProfiling!('profiled-program');
      await wait(100);
      expect(() => {
        const profile = PrivateCpuProfilerBindings.stopProfiling!('profiled-program', Number.MAX_SAFE_INTEGER, 0, false);
        if (!profile) throw new Error('No profile');
      }).toThrow('StopProfiling expects a valid format type as second argument.');
    });

    test('collects resources', async () => {
      PrivateCpuProfilerBindings.startProfiling!('profiled-program');
      await wait(100);

      const profile = PrivateCpuProfilerBindings.stopProfiling!('profiled-program', 0, 0, true);
      if (!profile) throw new Error('No profile');

      expect(profile.resources.length).toBeGreaterThan(0);

      expect(new Set(profile.resources).size).toBe(profile.resources.length);

      for (const resource of profile.resources) {
        expect(typeof resource).toBe('string');
        expect(resource).not.toBe(undefined);
      }
    });

    test('does not collect resources', async () => {
      PrivateCpuProfilerBindings.startProfiling!('profiled-program');
      await wait(100);

      const profile = PrivateCpuProfilerBindings.stopProfiling!('profiled-program', 0, 0, false);
      if (!profile) throw new Error('No profile');

      expect(profile.resources.length).toBe(0);
    });
  });

  describe('Profiler bindings', () => {
    test('exports profiler binding methods', () => {
      expect(typeof CpuProfilerBindings['startProfiling']).toBe('function');
      expect(typeof CpuProfilerBindings['stopProfiling']).toBe('function');
    });

    test('profiles a program', async () => {
      const profile = await profiled('profiled-program', async () => {
        await wait(100);
      });

      if (!profile) fail('Profile is null');

      assertValidSamplesAndStacks(profile.stacks, profile.samples);
    });

    test('adds thread_id info', async () => {
      const profile = await profiled('profiled-program', async () => {
        await wait(100);
      });

      if (!profile) fail('Profile is null');
      const samples = profile.samples;

      if (!samples.length) {
        throw new Error('No samples');
      }
      for (const sample of samples) {
        expect(sample.thread_id).toBe('0');
      }
    });

    test('caps stack depth at 128', async () => {
      const recurseToDepth = async (depth: number): Promise<number> => {
        if (depth === 0) {
          // Wait a bit to make sure stack gets sampled here
          await wait(1000);
          return 0;
        }
        const v = await recurseToDepth(depth - 1);
        return v;
      };

      const profile = await profiled('profiled-program', async () => {
        await recurseToDepth(256);
      });

      if (!profile) fail('Profile is null');

      for (const stack of profile.stacks) {
        expect(stack.length).toBeLessThanOrEqual(128);
      }
    });

    test('does not record two profiles when titles match', () => {
      CpuProfilerBindings.startProfiling('same-title');
      CpuProfilerBindings.startProfiling('same-title');

      const first = CpuProfilerBindings.stopProfiling('same-title', 0);
      const second = CpuProfilerBindings.stopProfiling('same-title', 0);

      expect(first).not.toBe(null);
      expect(second).toBe(null);
    });

    test('multiple calls with same title', () => {
      CpuProfilerBindings.startProfiling('same-title');
      expect(() => {
        CpuProfilerBindings.stopProfiling('same-title', 0);
        CpuProfilerBindings.stopProfiling('same-title', 0);
      }).not.toThrow();
    });

    test('does not crash if stopTransaction is called before startTransaction', () => {
      expect(CpuProfilerBindings.stopProfiling('does not exist', 0)).toBe(null);
    });

    test('does crash if name is invalid', () => {
      expect(() => CpuProfilerBindings.stopProfiling('', 0)).toThrow();
      // @ts-expect-error test invalid input
      expect(() => CpuProfilerBindings.stopProfiling(undefined)).toThrow();
      // @ts-expect-error test invalid input
      expect(() => CpuProfilerBindings.stopProfiling(null)).toThrow();
      // @ts-expect-error test invalid input
      expect(() => CpuProfilerBindings.stopProfiling({})).toThrow();
    });

    test('does not throw if stopTransaction is called before startTransaction', () => {
      expect(CpuProfilerBindings.stopProfiling('does not exist', 0)).toBe(null);
      expect(() => CpuProfilerBindings.stopProfiling('does not exist', 0)).not.toThrow();
    });

    test('compiles with eager logging by default', async () => {
      const profile = await profiled('profiled-program', async () => {
        await wait(100);
      });

      if (!profile) fail('Profile is null');
      expect(profile.profiler_logging_mode).toBe('eager');
    });

    test('chunk format type', async () => {
      const fn = async () => {
        await wait(1000);
        fibonacci(36);
        await wait(1000);
      };

      CpuProfilerBindings.startProfiling('non nullable stack');
      await fn();
      const profile = CpuProfilerBindings.stopProfiling('non nullable stack', ProfileFormat.CHUNK);

      if (!profile) fail('Profile is null');

      for (const sample of profile.samples) {
        if (!('timestamp' in sample)) {
          throw new Error(`Sample ${JSON.stringify(sample)} has no timestamp`);
        }
        expect(sample.timestamp).toBeDefined();
        // No older than a minute and not in the future. Timestamp is in seconds so convert to ms
        // as the constructor expects ms.
        expect(new Date((sample.timestamp as number) * 1e3).getTime()).toBeGreaterThan(Date.now() - 60 * 1e3);
        expect(new Date((sample.timestamp as number) * 1e3).getTime()).toBeLessThanOrEqual(Date.now());
      }
    });

    test('stacks are not null', async () => {
      const profile = await profiled('non nullable stack', async () => {
        await wait(1000);
        fibonacci(36);
        await wait(1000);
      });

      if (!profile) fail('Profile is null');
      assertValidSamplesAndStacks(profile.stacks, profile.samples);
    });

    test('samples at ~99hz', async () => {
      CpuProfilerBindings.startProfiling('profile');
      await wait(100);
      const profile = CpuProfilerBindings.stopProfiling('profile', 0);

      if (!profile) fail('Profile is null');

      // Exception for macos and windows - we seem to get way less samples there, but I'm not sure if that's due to poor
      // performance of the actions runner, machine or something else. This needs more investigation to determine
      // the cause of low sample count. https://github.com/actions/runner-images/issues/1336 seems relevant.
      if (process.platform === 'darwin' || process.platform === 'win32') {
        if (profile.samples.length < 2) {
          fail(`Only ${profile.samples.length} samples obtained on ${process.platform}, expected at least 2`);
        }
      } else {
        if (profile.samples.length < 6) {
          fail(`Only ${profile.samples.length} samples obtained on ${process.platform}, expected at least 6`);
        }
      }
      if (profile.samples.length > 15) {
        fail(`Too many samples on ${process.platform}, got ${profile.samples.length}`);
      }
    });

    test('collects memory footprint', async () => {
      CpuProfilerBindings.startProfiling('profile');
      await wait(1000);
      const profile = CpuProfilerBindings.stopProfiling('profile', 0);

      const heap_usage = profile?.measurements['memory_footprint'];
      if (!heap_usage) {
        throw new Error('memory_footprint is null');
      }
      expect(heap_usage.values.length).toBeGreaterThan(6);
      expect(heap_usage.values.length).toBeLessThanOrEqual(11);
      expect(heap_usage.unit).toBe('byte');
      expect(heap_usage.values.every(v => isValidMeasurementValue(v.value))).toBe(true);
      assertValidMeasurements(profile.measurements['memory_footprint']);
    });

    test('collects cpu usage', async () => {
      CpuProfilerBindings.startProfiling('profile');
      await wait(1000);
      const profile = CpuProfilerBindings.stopProfiling('profile', 0);

      const cpu_usage = profile?.measurements['cpu_usage'];
      if (!cpu_usage) {
        throw new Error('cpu_usage is null');
      }
      expect(cpu_usage.values.length).toBeGreaterThan(6);
      expect(cpu_usage.values.length).toBeLessThanOrEqual(11);
      expect(cpu_usage.values.every(v => isValidMeasurementValue(v.value))).toBe(true);
      expect(cpu_usage.unit).toBe('percent');
      assertValidMeasurements(profile.measurements['cpu_usage']);
    });

    test('does not overflow measurement buffer if profile runs longer than 30s', async () => {
      CpuProfilerBindings.startProfiling('profile');
      await wait(35000);
      const profile = CpuProfilerBindings.stopProfiling('profile', 0);
      expect(profile).not.toBe(null);
      expect(profile?.measurements?.['cpu_usage']?.values.length).toBeLessThanOrEqual(300);
      expect(profile?.measurements?.['memory_footprint']?.values.length).toBeLessThanOrEqual(300);
    });

    // eslint-disable-next-line @sentry-internal/sdk/no-skipped-tests
    test.skip('includes deopt reason', async () => {
      // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#52-the-object-being-iterated-is-not-a-simple-enumerable
      function iterateOverLargeHashTable() {
        const table: Record<string, number> = {};
        for (let i = 0; i < 1e5; i++) {
          table[i] = i;
        }
        // eslint-disable-next-line
        for (const _ in table) {
        }
      }

      const profile = await profiled('profiled-program', async () => {
        iterateOverLargeHashTable();
      });

      expect(profile).not.toBe(null);

      // @ts-expect-error test invalid input
      const hasDeoptimizedFrame = profile?.frames.some(f => f.deopt_reasons?.length > 0);
      expect(hasDeoptimizedFrame).toBe(true);
    });

    test('does not crash if the native startProfiling function is not available', async () => {
      const original = PrivateCpuProfilerBindings.startProfiling;
      PrivateCpuProfilerBindings.startProfiling = undefined;

      expect(() => {
        CpuProfilerBindings.startProfiling('profiled-program');
      }).not.toThrow();

      PrivateCpuProfilerBindings.startProfiling = original;
    });

    test('does not crash if the native stopProfiling function is not available', async () => {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      const original = PrivateCpuProfilerBindings.stopProfiling;
      PrivateCpuProfilerBindings.stopProfiling = undefined;

      expect(() => {
        CpuProfilerBindings.stopProfiling('profiled-program', 0);
      }).not.toThrow();

      PrivateCpuProfilerBindings.stopProfiling = original;
    });
  });
});
