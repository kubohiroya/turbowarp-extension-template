import {extensionConfig} from './config.js';
import sceneSchema from '../schemas/scene-properties.schema.json';
import noteSchema from '../schemas/note-properties.schema.json';

// Structural subset of the host API; the shared package is not published yet.
// Keep React, RJSF, validation and codecs in the host, outside this bundle.
export interface SchemaBlockEditorDefinition {
  readonly apiVersion: 1;
  readonly extensionId: string;
  readonly editorId: string;
  readonly opcodes: readonly string[];
  readonly argument: string;
  readonly format: 'json' | 'yaml';
  readonly schema: Record<string, unknown>;
  readonly uiSchema?: Record<string, unknown>;
}

export interface SchemaBlockEditorApi {
  readonly apiVersion: number;
  register(definition: SchemaBlockEditorDefinition): () => void;
}

export const blockEditorDefinitions: readonly SchemaBlockEditorDefinition[] = [
  {
    apiVersion: 1,
    extensionId: extensionConfig.id,
    editorId: 'scene-properties',
    opcodes: [`${extensionConfig.id}_sceneJson`],
    argument: 'SOURCE',
    format: 'json',
    schema: sceneSchema,
    uiSchema: {'ui:order': ['title', 'duration', '*']}
  },
  {
    apiVersion: 1,
    extensionId: extensionConfig.id,
    editorId: 'note-properties',
    opcodes: [`${extensionConfig.id}_noteYaml`],
    argument: 'SOURCE',
    format: 'yaml',
    schema: noteSchema,
    uiSchema: {body: {'ui:widget': 'textarea'}, 'ui:order': ['title', 'body', '*']}
  }
];

/** Register atomically and release only the registrations owned by this extension. */
export function registerBlockEditors(scratch: ScratchApi): () => void {
  const api = scratch.gui?.blockEditors;
  if (!api || api.apiVersion !== 1) return () => {};

  const removers: Array<() => void> = [];
  const dispose = () => {
    for (const remove of removers.splice(0).reverse()) {
      try { remove(); } catch (error) { console.error('Block editor cleanup failed:', error); }
    }
  };
  try {
    for (const definition of blockEditorDefinitions) removers.push(api.register(definition));
  } catch (error) {
    dispose();
    console.error('Could not register the example block editors:', error);
  }
  return dispose;
}
