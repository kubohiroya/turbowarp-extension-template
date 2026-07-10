import {beforeEach, describe, expect, it, vi} from 'vitest';
import {ExampleExtension} from '../src/extension';

beforeEach(() => {
  vi.stubGlobal('Scratch', {
    BlockType: {REPORTER: 'reporter'},
    ArgumentType: {STRING: 'string'},
    Cast: {
      toString: (value: unknown) => String(value)
    }
  });
});

describe('ExampleExtension', () => {
  it('returns a greeting', () => {
    const extension = new ExampleExtension();
    expect(extension.hello({NAME: 'TurboWarp'})).toBe('Hello, TurboWarp!');
  });
});
