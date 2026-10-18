import {readFileSync} from 'node:fs';
import {expect,it} from 'vitest';
import {decodeExampleSource,validateExampleSource} from '../src/editor-schema.js';
const context={consumerId:'examples',nowMs:0,settings:null};
it('existing scene JSON and note YAML retain source/raw data without defaults or format migration',()=>{
 for(const kind of ['scene','note'] as const){const source=readFileSync(`tests/fixtures/${kind}.${kind==='scene'?'json':'yaml'}`,'utf8');const decoded=decodeExampleSource(source,kind);expect(validateExampleSource(source,kind,context).result.kind).toBe('valid');expect(validateExampleSource(source,kind,context).source).toBe(source);expect(decoded.source).toBe(source);}
});
it('both fixed example schemas reject invalid structure and preserve additional fields',()=>{
 for(const [source,kind,valid] of [['{"title":"Scene","duration":2,"extra":{"raw":true}}','scene',true],['title: Note\nbody: |\n  Original text\n','note',true],['{"title":"","duration":0}','scene',false],['title: Note\n','note',false],['{broken','scene',false]] as const){const result=validateExampleSource(source,kind,context);expect(result.result.kind==='valid').toBe(valid);expect(result.source).toBe(source);}
});

it('malformed JSON/YAML reports safe diagnostics without reading context accessors',()=>{
 let reads=0;const accessor=Object.defineProperty({...context},'consumerId',{enumerable:true,get(){reads++;throw Error('private-context');}});
 for(const kind of ['scene','note'] as const){
  for(const invalidContext of [accessor,null,undefined]){
   const source='{private malformed',result=validateExampleSource(source,kind,invalidContext as never);
   expect(result.source).toBe(source);expect(result.result.kind).toBe('invalid');
   expect(result.result.diagnostics[0]?.code).toBe('input-format-invalid');
   expect(result.result.diagnostics[0]?.scope).not.toHaveProperty('consumerId');
   expect(JSON.stringify(result.result)).not.toContain('private');
  }
  expect(validateExampleSource('{broken',kind,context).result.diagnostics[0]?.scope.consumerId).toBe(context.consumerId);
 }
 expect(reads).toBe(0);
 expect(validateExampleSource('{"title":"Scene","duration":2}','scene',accessor).result.kind).toBe('execution-error');
 expect(reads).toBe(0);
});
