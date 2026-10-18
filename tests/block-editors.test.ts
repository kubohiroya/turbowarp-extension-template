import {afterEach, describe, expect, it, vi} from 'vitest';
import {blockEditorDefinitions, registerBlockEditors} from '../src/block-editors.js';
import definitions from '../src/block-definitions.json';
import {extensionConfig} from '../src/config.js';
import {ExampleExtension} from '../src/extension.js';

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

function scratchFixture() {
  const removers = [vi.fn(), vi.fn()];
  const register = vi.fn().mockReturnValueOnce(removers[0]).mockReturnValueOnce(removers[1]);
  const scratch = {
    gui: {blockEditors: {apiVersion: 1, register}},
    extensions: {unsandboxed: false, register: vi.fn()}
  } as unknown as ScratchApi;
  return {scratch, register, removers};
}

describe('schema block editors', () => {
  it('maps complete opcodes to existing string arguments, formats and distinct static schemas', () => {
    expect(blockEditorDefinitions.map(editor => editor.format)).toEqual(['json', 'yaml']);
    expect(blockEditorDefinitions[0]?.schema).not.toEqual(blockEditorDefinitions[1]?.schema);
    for (const editor of blockEditorDefinitions) {
      expect(editor.extensionId).toBe(extensionConfig.id);
      for (const opcode of editor.opcodes) {
        const block = definitions.blocks.find(block => `${extensionConfig.id}_${block.opcode}` === opcode);
        expect(block?.arguments).toHaveProperty(editor.argument);
        expect(block?.arguments.SOURCE?.type).toBe('STRING');
      }
      expect(editor.schema.$schema).toBe('http://json-schema.org/draft-07/schema#');
    }
  });

  it('registers both editors and releases them once in reverse order', () => {
    const {scratch, register, removers} = scratchFixture();
    const dispose = registerBlockEditors(scratch);
    expect(register.mock.calls.map(([editor]) => editor)).toEqual(blockEditorDefinitions);
    dispose();
    dispose();
    for (const remove of removers) expect(remove).toHaveBeenCalledTimes(1);
    expect(removers[1]?.mock.invocationCallOrder[0]).toBeLessThan(removers[0]!.mock.invocationCallOrder[0]!);
  });

  it('tolerates missing GUI, missing API and incompatible API versions', () => {
    for (const scratch of [{}, {gui: {}}, {gui: {blockEditors: {apiVersion: 2}}}]) {
      expect(() => registerBlockEditors(scratch as ScratchApi)()).not.toThrow();
    }
  });

  it('rolls back partial registration and reports the failure without breaking execution', () => {
    const {scratch, register, removers} = scratchFixture();
    const error = new Error('Unsupported schema');
    register.mockReset().mockReturnValueOnce(removers[0]).mockImplementationOnce(() => { throw error; });
    const report = vi.spyOn(console, 'error').mockImplementation(() => {});
    const dispose = registerBlockEditors(scratch);
    expect(removers[0]).toHaveBeenCalledOnce();
    expect(report).toHaveBeenCalledWith('Could not register the example block editors:', error);
    dispose();
    expect(removers[0]).toHaveBeenCalledOnce();
  });

  it('continues releasing other editors when one cleanup fails', () => {
    const {scratch, removers} = scratchFixture();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    removers[1]!.mockImplementation(() => { throw new Error('cleanup'); });
    const dispose = registerBlockEditors(scratch);
    dispose();
    expect(removers[0]).toHaveBeenCalledOnce();
  });

  it('connects unregister to the extension lifecycle', () => {
    const {scratch, removers} = scratchFixture();
    vi.stubGlobal('Scratch', scratch);
    const extension = new ExampleExtension();
    extension.initializeBlockEditors();
    extension.dispose();
    extension.dispose();
    for (const remove of removers) expect(remove).toHaveBeenCalledOnce();
  });

  it('reinitializes only editor registrations without disposing unrelated extension resources', () => {
    const {scratch, register, removers} = scratchFixture();
    const nextRemovers = [vi.fn(), vi.fn()];
    register.mockReturnValueOnce(nextRemovers[0]).mockReturnValueOnce(nextRemovers[1]);
    vi.stubGlobal('Scratch', scratch);
    const disposeResources = vi.fn();
    class ExtensionWithResources extends ExampleExtension {
      public override dispose(): void {
        disposeResources();
        super.dispose();
      }
    }
    const extension = new ExtensionWithResources();
    extension.initializeBlockEditors();
    extension.initializeBlockEditors();
    expect(register).toHaveBeenCalledTimes(4);
    for (const remove of removers) expect(remove).toHaveBeenCalledOnce();
    for (const remove of nextRemovers) expect(remove).not.toHaveBeenCalled();
    expect(disposeResources).not.toHaveBeenCalled();
    extension.dispose();
    expect(disposeResources).toHaveBeenCalledOnce();
    for (const remove of nextRemovers) expect(remove).toHaveBeenCalledOnce();
  });

  it.each([false, true])('registers and executes normally with GUI available = %s', async available => {
    vi.resetModules();
    const {scratch, register} = scratchFixture();
    if (!available) delete scratch.gui;
    scratch.Cast = {toString: value => String(value), toNumber: Number, toBoolean: Boolean};
    vi.stubGlobal('Scratch', scratch);
    await import('../src/index.js');
    expect(scratch.extensions.register).toHaveBeenCalledOnce();
    expect(register).toHaveBeenCalledTimes(available ? 2 : 0);
    const extension = vi.mocked(scratch.extensions.register).mock.calls[0]![0] as ExampleExtension;
    for (const block of definitions.blocks.slice(1)) {
      const source = block.arguments.SOURCE!.defaultValue;
      expect(extension[block.opcode as 'sceneJson' | 'noteYaml']({SOURCE: source})).toBe(source);
    }
  });

  it('unregisters on page exit and preserves registrations for a cached page', async () => {
    vi.resetModules();
    const {scratch, removers} = scratchFixture();
    let onPageHide: (event: {persisted: boolean}) => void = () => {};
    vi.stubGlobal('window', {addEventListener: (name: string, callback: typeof onPageHide) => {
      expect(name).toBe('pagehide'); onPageHide = callback;
    }});
    vi.stubGlobal('Scratch', scratch);
    await import('../src/index.js');
    onPageHide({persisted: true});
    for (const remove of removers) expect(remove).not.toHaveBeenCalled();
    onPageHide({persisted: false});
    for (const remove of removers) expect(remove).toHaveBeenCalledOnce();
  });
});
