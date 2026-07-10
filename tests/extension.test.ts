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
    expect(info.name).toBe('Example Extension');
    expect(info.blocks[0]?.text).toBe('hello [NAME]');
  });
});
