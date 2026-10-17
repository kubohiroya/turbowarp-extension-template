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
  	blocks: [
  		{
  			"opcode": "hello",
  			"blockType": "REPORTER",
  			"text": "hello [NAME]",
  			"description": "Returns a localized greeting for the supplied name.",
  			"arguments": { "NAME": {
  				"type": "STRING",
  				"defaultValue": "world"
  			} }
  		},
  		{
  			"opcode": "sceneJson",
  			"blockType": "REPORTER",
  			"text": "scene JSON [SOURCE]",
  			"description": "Returns the JSON source unchanged; a compatible GUI can edit its scene properties.",
  			"arguments": { "SOURCE": {
  				"type": "STRING",
  				"defaultValue": "{\"title\":\"最初のシーン\",\"duration\":3}"
  			} }
  		},
  		{
  			"opcode": "noteYaml",
  			"blockType": "REPORTER",
  			"text": "note YAML [SOURCE]",
  			"description": "Returns the YAML source unchanged; a compatible GUI can edit its note properties.",
  			"arguments": { "SOURCE": {
  				"type": "STRING",
  				"defaultValue": "title: 'メモ「春」'\nbody: |\n  一行目の \"引用\"\n  二行目\n"
  			} }
  		}
  	]
  };
  //#endregion
  //#region src/block-editors.ts
  var blockEditorDefinitions = [{
  	apiVersion: 1,
  	extensionId: extensionConfig.id,
  	editorId: "scene-properties",
  	opcodes: [`${extensionConfig.id}_sceneJson`],
  	argument: "SOURCE",
  	format: "json",
  	schema: {
  		$schema: "http://json-schema.org/draft-07/schema#",
  		title: "Scene properties",
  		type: "object",
  		properties: {
  			"title": {
  				"type": "string",
  				"minLength": 1,
  				"title": "Title"
  			},
  			"duration": {
  				"type": "number",
  				"minimum": 1,
  				"maximum": 60,
  				"title": "Duration (seconds)"
  			}
  		},
  		required: ["title", "duration"],
  		additionalProperties: true
  	},
  	uiSchema: { "ui:order": [
  		"title",
  		"duration",
  		"*"
  	] }
  }, {
  	apiVersion: 1,
  	extensionId: extensionConfig.id,
  	editorId: "note-properties",
  	opcodes: [`${extensionConfig.id}_noteYaml`],
  	argument: "SOURCE",
  	format: "yaml",
  	schema: {
  		$schema: "http://json-schema.org/draft-07/schema#",
  		title: "Note properties",
  		type: "object",
  		properties: {
  			"title": {
  				"type": "string",
  				"minLength": 1,
  				"title": "Title"
  			},
  			"body": {
  				"type": "string",
  				"minLength": 1,
  				"title": "Body"
  			}
  		},
  		required: ["title", "body"],
  		additionalProperties: true
  	},
  	uiSchema: {
  		body: { "ui:widget": "textarea" },
  		"ui:order": [
  			"title",
  			"body",
  			"*"
  		]
  	}
  }];
  /** Register atomically and release only the registrations owned by this extension. */
  function registerBlockEditors(scratch) {
  	const api = scratch.gui?.blockEditors;
  	if (!api || api.apiVersion !== 1) return () => {};
  	const removers = [];
  	const dispose = () => {
  		for (const remove of removers.splice(0).reverse()) try {
  			remove();
  		} catch (error) {
  			console.error("Block editor cleanup failed:", error);
  		}
  	};
  	try {
  		for (const definition of blockEditorDefinitions) removers.push(api.register(definition));
  	} catch (error) {
  		dispose();
  		console.error("Could not register the example block editors:", error);
  	}
  	return dispose;
  }
  //#endregion
  //#region src/extension.ts
  var blockDefinitions = block_definitions_default.blocks;
  var ExampleExtension = class {
  	constructor() {
  		this.unregisterBlockEditors = () => {};
  	}
  	initializeBlockEditors() {
  		this.unregisterBlockEditors();
  		this.unregisterBlockEditors = registerBlockEditors(Scratch);
  	}
  	dispose() {
  		this.unregisterBlockEditors();
  	}
  	getInfo() {
  		return {
  			id: extensionConfig.id,
  			name: Scratch.translate(block_definitions_default.extensionName),
  			docsURI: extensionConfig.docsURI,
  			blockIconURI: extensionConfig.blockIconURI,
  			blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
  		};
  	}
  	hello(args) {
  		return Scratch.translate({
  			default: "Hello, {name}!",
  			description: "{name} is replaced with the value supplied to the block."
  		}, { name: Scratch.Cast.toString(args.NAME) });
  	}
  	sceneJson(args) {
  		return Scratch.Cast.toString(args.SOURCE);
  	}
  	noteYaml(args) {
  		return Scratch.Cast.toString(args.SOURCE);
  	}
  	toScratchBlock(block) {
  		return {
  			opcode: block.opcode,
  			blockType: Scratch.BlockType[block.blockType],
  			text: Scratch.translate(block.text),
  			arguments: Object.fromEntries(Object.entries(block.arguments).map(([name, argument]) => [name, {
  				type: Scratch.ArgumentType[argument.type],
  				defaultValue: argument.defaultValue
  			}]))
  		};
  	}
  };
  //#endregion
  //#region src/index.ts
  if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  var extension = new ExampleExtension();
  Scratch.extensions.register(extension);
  extension.initializeBlockEditors();
  if (typeof window !== "undefined") window.addEventListener("pagehide", (event) => {
  	if (!event.persisted) extension.dispose();
  });
  //#endregion

})(Scratch);
