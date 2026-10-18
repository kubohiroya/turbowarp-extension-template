import scene from '../schemas/scene-properties.schema.json' with {type: 'json'};
import note from '../schemas/note-properties.schema.json' with {type: 'json'};
import {parse as parseYaml} from 'yaml';
import {compileSchemaBundle, validateSchemaInput} from '@kubohiroya/turbowarp-extension-data-editor/schema';
import type {SchemaBundle, SchemaDocument, SchemaJsonValue, SchemaValidationContext, InputDiagnostic} from '@kubohiroya/turbowarp-extension-data-editor/schema';
export type ExampleContract = 'scene' | 'note';
function bundle(document: typeof scene | typeof note, kind: ExampleContract): SchemaBundle {
  const source={repository:'turbowarp-extension-template',path:`schemas/${kind}-properties.schema.json`};
  return {identity:{ownerId:'turbowarp-extension-template',contractId:`${kind}-example`,revision:'schema-v0.4.0',variantId:kind==='scene'?'json':'yaml'},dialect:'draft-07',
    root:{retrievalUri:`https://kubohiroya.github.io/turbowarp-extension-template/schemas/${kind}-properties.schema.json`,document:document as SchemaDocument,artifact:{role:'canonical-schema',source}},resources:[],
    provenance:{canonicalSources:[source],generatedFiles:[],referenceSchemas:[],generationSources:[]}};
}
export const exampleSchemaBundles={scene:bundle(scene,'scene'),note:bundle(note,'note')} as const;
const compiled={scene:compileSchemaBundle(exampleSchemaBundles.scene),note:compileSchemaBundle(exampleSchemaBundles.note)};
export function decodeExampleSource(source:string,contract:ExampleContract){
  const format=contract==='scene'?'json' as const:'yaml' as const;
  return {source,contract,format,variantId:format,data:(format==='json'?JSON.parse(source):parseYaml(source)) as SchemaJsonValue};
}
/** Headless validation of the existing examples; their runtime reporters still return source text. */
export function validateExampleSource(source:string,contract:ExampleContract,context:SchemaValidationContext){
  let decoded:ReturnType<typeof decodeExampleSource>;
  try {decoded=decodeExampleSource(source,contract);}catch{
    const diagnostics:readonly [InputDiagnostic & {phase:'decode'}]=[{scope:{identity:exampleSchemaBundles[contract].identity,consumerId:context.consumerId},phase:'decode',code:'input-format-invalid',dataPath:''}];
    return {source,result:{kind:'invalid' as const,diagnostics}};
  }
  const prepared=compiled[contract];return {...decoded,result:prepared.kind==='compiled'?validateSchemaInput(prepared.validator,decoded.data,{context}):prepared};
}
