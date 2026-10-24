import {afterEach, describe, expect, it, vi} from 'vitest';
import type {ScratchApi} from '../src/runtime-api.js';

function host(prefix: string): ScratchApi {
  return {
    extensions: {unsandboxed: false, register: vi.fn()},
    BlockType: {COMMAND: 'command', REPORTER: `${prefix}reporter`, BOOLEAN: 'boolean', HAT: 'hat'},
    ArgumentType: {STRING: `${prefix}string`, NUMBER: 'number', BOOLEAN: 'boolean'},
    Cast: {toString: value => `${prefix}${String(value)}`, toNumber: Number, toBoolean: Boolean},
    translate: (message: string | {default: string; description?: string}, placeholders: Record<string, string | number> = {}) => {
      const text = typeof message === 'string' ? message : message.default;
      return prefix + Object.entries(placeholders).reduce(
        (result, [key, value]) => result.replace(`{${key}}`, String(value)), text
      );
    }
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('bundle module', () => {
  it('imports without reading host globals or registering anything', async () => {
    vi.resetModules();
    for (const name of ['Scratch', 'window', 'document']) {
      vi.stubGlobal(name, undefined);
      Object.defineProperty(globalThis, name, {
        configurable: true,
        get() { throw new Error(`Unexpected global access: ${name}`); }
      });
    }
    const module = await import('../src/bundle-module.js');
    expect(module.bundleModuleMetadata).toEqual({
      formatVersion: 1, id: 'kubohiroyaexampleextension', unsandboxed: 'not-needed'
    });
    expect(Object.isFrozen(module.bundleModuleMetadata)).toBe(true);
    const scratch = host('');
    const instance = module.createExtension(scratch);
    expect(instance.hello({NAME: 'TurboWarp'})).toBe('Hello, TurboWarp!');
    expect(scratch.extensions.register).not.toHaveBeenCalled();
  });

  it('keeps each member host bound to its own instance, including deferred calls', async () => {
    vi.stubGlobal('Scratch', new Proxy({}, {get() { throw new Error('Global Scratch was used.'); }}));
    const {createExtension} = await import('../src/bundle-module.js');
    const firstHost = host('first:');
    const secondHost = host('second:');
    const first = createExtension(firstHost);
    const second = createExtension(secondHost);
    expect(first).not.toBe(second);
    for (const [instance, prefix] of [[second, 'second:'], [first, 'first:']] as const) {
      expect(instance.hello({NAME: 'Ada'})).toBe(`${prefix}Hello, ${prefix}Ada!`);
      const info = instance.getInfo() as {name: string; blocks: {blockType: string; arguments: {NAME: {type: string}}}[]};
      expect(info.name).toBe(`${prefix}TurboWarp-Example-Extension`);
      expect(info.blocks[0]?.blockType).toBe(`${prefix}reporter`);
      expect(info.blocks[0]?.arguments.NAME.type).toBe(`${prefix}string`);
    }
    expect(firstHost.extensions.register).not.toHaveBeenCalled();
    expect(secondHost.extensions.register).not.toHaveBeenCalled();
  });

  it('preserves standalone metadata and behavior while registering exactly once', async () => {
    vi.resetModules();
    const scratch = host('');
    vi.stubGlobal('Scratch', scratch);
    const {createExtension} = await import('../src/bundle-module.js');
    const expected = createExtension(scratch);
    await import('../src/index.js');
    expect(scratch.extensions.register).toHaveBeenCalledOnce();
    const actual = vi.mocked(scratch.extensions.register).mock.calls[0]?.[0] as typeof expected;
    expect(actual.getInfo()).toEqual(expected.getInfo());
    expect(actual.hello({NAME: 42})).toBe(expected.hello({NAME: 42}));
  });
});
