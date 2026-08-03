// Name: Example Extension
// ID: kubohiroyaexampleextension
// Description: A TypeScript-based TurboWarp extension.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  const extensionConfig = {
    id: "kubohiroyaexampleextension"
  };
  const extensionName = "Example Extension";
  const blocks = [{ "opcode": "hello", "blockType": "REPORTER", "text": "hello [NAME]", "description": "Returns a localized greeting for the supplied name.", "arguments": { "NAME": { "type": "STRING", "defaultValue": "world" } } }];
  const definitions = {
    extensionName,
    blocks
  };
  const blockDefinitions = definitions.blocks;
  class ExampleExtension {
    getInfo() {
      return {
        id: extensionConfig.id,
        name: Scratch.translate(definitions.extensionName),
        blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
      };
    }
    hello(args) {
      return Scratch.translate(
        {
          default: "Hello, {name}!",
          description: "{name} is replaced with the value supplied to the block."
        },
        { name: Scratch.Cast.toString(args.NAME) }
      );
    }
    toScratchBlock(block) {
      return {
        opcode: block.opcode,
        blockType: Scratch.BlockType[block.blockType],
        text: Scratch.translate(block.text),
        arguments: Object.fromEntries(
          Object.entries(block.arguments).map(([name, argument]) => [
            name,
            {
              type: Scratch.ArgumentType[argument.type],
              defaultValue: argument.defaultValue
            }
          ])
        )
      };
    }
  }
  Scratch.extensions.register(new ExampleExtension());

})(Scratch);
