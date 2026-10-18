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
