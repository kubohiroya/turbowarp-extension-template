import assert from 'node:assert/strict';
import console from 'node:console';
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import process from 'node:process';
import {pathToFileURL, URL} from 'node:url';
import {runInNewContext} from 'node:vm';
import {test} from 'node:test';

const packagePath = process.env.BLOCK_EDITOR_PACKAGE_DIR;
if (!packagePath) throw new Error('Set BLOCK_EDITOR_PACKAGE_DIR to the installed @kubohiroya/turbowarp-extension-data-editor package or its built checkout.');
const {EditorRegistry} = await import(pathToFileURL(resolve(packagePath, 'dist/index.js')).href);
const {createSchemaEditor} = await import(pathToFileURL(resolve(packagePath, 'dist/rjsf.js')).href);
const {decodeSource, encodeSource} = await import(pathToFileURL(resolve(packagePath, 'dist/codec.js')).href);
const bundle = await readFile(new URL('../dist/example-extension.js', import.meta.url), 'utf8');

test('built extension registers static schemas and round-trips both formats with the real host', async () => {
  const registry = new EditorRegistry();
  const definitions = [];
  let extension;
  const Scratch = {
    extensions: {register: value => { extension = value; }},
    Cast: {toString: value => String(value)},
    gui: {blockEditors: {apiVersion: 1, register: definition => {
      definitions.push(definition);
      // Mirror the GUI's structural-data boundary between JavaScript realms.
      return registry.register(createSchemaEditor(JSON.parse(JSON.stringify(definition))));
    }}}
  };
  runInNewContext(bundle, {Scratch, console});
  assert.equal(definitions.length, 2);
  for (const definition of definitions) {
    const file = definition.format === 'json' ? 'scene.json' : 'note.yaml';
    const source = await readFile(new URL(`./fixtures/${file}`, import.meta.url), 'utf8');
    const block = {targetId: 'sprite', blockId: file, opcode: definition.opcodes[0], revision: '1',
      arguments: {[definition.argument]: {kind: 'literal', value: source}}};
    let commits = 0;
    const host = {readBlock: () => block, commit: request => {
      assert.equal(request.changes.length, 1);
      assert.equal(request.changes[0].argument, 'SOURCE');
      commits++;
      block.arguments.SOURCE.value = request.changes[0].value;
    }};
    const session = registry.open(block, host);
    const original = session.getDraft().data;
    const replacement = {...original, title: '再編集「秋」 & "edited"'};
    session.setDraft({data: replacement});
    assert.equal(block.arguments.SOURCE.value, source);
    assert.equal((await session.save()).status, 'saved');
    assert.equal(commits, 1);
    assert.deepEqual(decodeSource(block.arguments.SOURCE.value, definition.format), replacement);
    assert.equal(extension[definition.opcodes[0].split('_').at(-1)]({SOURCE: block.arguments.SOURCE.value}),
      block.arguments.SOURCE.value);
    const reopened = registry.open(block, host);
    assert.deepEqual(reopened.getDraft().data, replacement);
    reopened.setDraft({data: {...replacement, title: ''}});
    assert.equal((await reopened.save()).status, 'invalid');
    assert.equal(commits, 1);
    reopened.cancel();
    const unchanged = registry.open(block, host);
    assert.deepEqual(await unchanged.save(), {status: 'saved', changed: false});
    assert.equal(commits, 1);
  }
  extension.dispose();
  for (const definition of definitions) assert.equal(registry.resolve(definition.opcodes[0]), undefined);
});

test('one scene schema supports both formats by changing only format in the registration', async () => {
  const schema = JSON.parse(await readFile(new URL('../schemas/scene-properties.schema.json', import.meta.url), 'utf8'));
  const data = JSON.parse(await readFile(new URL('./fixtures/scene.json', import.meta.url), 'utf8'));
  const options = {
    apiVersion: 1, extensionId: 'kubohiroyaexampleextension', editorId: 'shared-scene',
    opcodes: ['kubohiroyaexampleextension_sceneJson'], argument: 'SOURCE', schema
  };
  const registry = new EditorRegistry();
  for (const format of ['json', 'yaml']) {
    const unregister = registry.register(createSchemaEditor({...options, format}));
    const source = encodeSource(data, format);
    const block = {targetId: 'sprite', blockId: 'scene', opcode: options.opcodes[0], revision: '1',
      arguments: {SOURCE: {kind: 'literal', value: source}}};
    let commits = 0;
    const session = registry.open(block, {readBlock: () => block, commit: request => {
      commits++;
      block.arguments.SOURCE.value = request.changes[0].value;
    }});
    assert.deepEqual(session.getDraft(), {data});
    session.setDraft({data: {...data, duration: 0}});
    assert.equal((await session.save()).status, 'invalid');
    assert.equal(commits, 0);
    assert.equal(block.arguments.SOURCE.value, source);
    const replacement = {...data, duration: 7};
    session.setDraft({data: replacement});
    assert.equal((await session.save()).status, 'saved');
    assert.equal(commits, 1);
    assert.deepEqual(decodeSource(block.arguments.SOURCE.value, format), replacement);
    unregister();
  }
});
