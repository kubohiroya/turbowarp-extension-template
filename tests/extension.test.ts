import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {ExampleExtension} from '../src/extension.js';

beforeEach(() => {
  vi.stubGlobal('Scratch', {
    BlockType: {REPORTER: 'reporter'},
    ArgumentType: {STRING: 'string'},
    Cast: {
      toString: (value: unknown) => String(value)
    },
    translate: (
      message: string | {default: string},
      placeholders: Record<string, string | number> = {}
    ) => {
      const text = typeof message === 'string' ? message : message.default;
      return Object.entries(placeholders).reduce(
        (result, [name, value]) => result.replace(`{${name}}`, String(value)),
        text
      );
    }
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ExampleExtension', () => {
  it('returns a greeting', () => {
    const extension = new ExampleExtension();
    expect(extension.hello({NAME: 'TurboWarp'})).toBe('Hello, TurboWarp!');
  });

  it('uses localizable extension and block text', () => {
    const info = new ExampleExtension().getInfo() as {name: string; blocks: Array<{text: string}>};
    expect(info.name).toBe('TurboWarp-Example-Extension');
    expect(info.blocks[0]?.text).toBe('hello [NAME]');
  });

  it('publishes documentation and a self-contained SVG block icon', () => {
    const info = new ExampleExtension().getInfo() as {docsURI: string; blockIconURI: string};
    expect(info.docsURI).toBe('https://kubohiroya.github.io/turbowarp-extension-template/');
    expect(info.blockIconURI).toMatch(/^data:image\/svg\+xml;base64,/);
  });
});


it.each([false, true])('registers the minimal extension with GUI available = %s', async available => {
  vi.resetModules();
  const register = vi.fn();
  const gui = Object.defineProperty({}, 'blockEditors', {get() { throw new Error('Template must not access editor registration.'); }});
  vi.stubGlobal('Scratch', {extensions: {unsandboxed: false, register}, ...(available ? {gui} : {})});
  await import('../src/index.js');
  expect(register).toHaveBeenCalledOnce();
  expect(register.mock.calls[0]?.[0]).toBeInstanceOf((await import('../src/extension.js')).ExampleExtension);
});
