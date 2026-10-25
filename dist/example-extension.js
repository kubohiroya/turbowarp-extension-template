// Name: TurboWarp-Example-Extension
// ID: kubohiroyaexampleextension
// Description: A TypeScript-based TurboWarp extension.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  //#region src/config.ts
  var extensionConfig = {
  	id: "kubohiroyaexampleextension",
  	slug: "example-extension",
  	name: "TurboWarp-Example-Extension",
  	description: "A TypeScript-based TurboWarp extension.",
  	author: "Hiroya Kubo",
  	license: "MPL-2.0",
  	unsandboxed: false,
  	docsURI: "https://kubohiroya.github.io/turbowarp-extension-template/",
  	blockIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iNCIgeT0iOCIgd2lkdGg9IjE4IiBoZWlnaHQ9IjE0IiByeD0iMyIgZmlsbD0iIzRDOTdGRiIvPjxyZWN0IHg9IjI2IiB5PSI4IiB3aWR0aD0iMTgiIGhlaWdodD0iMTQiIHJ4PSIzIiBmaWxsPSIjNTlDMDU5Ii8+PHJlY3QgeD0iMTUiIHk9IjI2IiB3aWR0aD0iMTgiIGhlaWdodD0iMTQiIHJ4PSIzIiBmaWxsPSIjRkZBQjE5Ii8+PC9zdmc+"
  };
  var block_definitions_default = {
  	extensionName: "TurboWarp-Example-Extension",
  	blocks: [{
  		"opcode": "hello",
  		"blockType": "REPORTER",
  		"text": "hello [NAME]",
  		"description": "Returns a localized greeting for the supplied name.",
  		"arguments": { "NAME": {
  			"type": "STRING",
  			"defaultValue": "world"
  		} }
  	}]
  };
  //#endregion
  //#region src/extension.ts
  var blockDefinitions = block_definitions_default.blocks;
  var ExampleExtension = class {
  	constructor(scratch) {
  		this.scratch = scratch;
  	}
  	getInfo() {
  		return {
  			id: extensionConfig.id,
  			name: this.scratch.translate(block_definitions_default.extensionName),
  			docsURI: extensionConfig.docsURI,
  			blockIconURI: extensionConfig.blockIconURI,
  			blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
  		};
  	}
  	hello(args) {
  		return this.scratch.translate({
  			default: "Hello, {name}!",
  			description: "{name} is replaced with the value supplied to the block."
  		}, { name: this.scratch.Cast.toString(args.NAME) });
  	}
  	toScratchBlock(block) {
  		return {
  			opcode: block.opcode,
  			blockType: this.scratch.BlockType[block.blockType],
  			text: this.scratch.translate(block.text),
  			arguments: Object.fromEntries(Object.entries(block.arguments).map(([name, argument]) => [name, {
  				type: this.scratch.ArgumentType[argument.type],
  				defaultValue: argument.defaultValue
  			}]))
  		};
  	}
  };
  Object.freeze({
  	formatVersion: 1,
  	id: extensionConfig.id,
  	unsandboxed: extensionConfig.unsandboxed ? "required" : "not-needed"
  });
  /** The caller owns initialization order and registration; this function does not register. */
  function createExtension(scratch) {
  	return new ExampleExtension(scratch);
  }
  //#endregion
  //#region src/index.ts
  if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  Scratch.extensions.register(createExtension(Scratch));
  //#endregion

})(Scratch);
