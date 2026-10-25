import {extensionConfig} from './config.js';
import definitions from './block-definitions.json' with {type: 'json'};
import type {ScratchApi, TurboWarpExtension} from './runtime-api.js';

type BlockTypeName = 'REPORTER';
type ArgumentTypeName = 'STRING';

interface DefinitionArgument {
  type: ArgumentTypeName;
  defaultValue: string;
}

interface BlockDefinition {
  opcode: string;
  blockType: BlockTypeName;
  text: string;
  description: string;
  arguments: Record<string, DefinitionArgument>;
}

const blockDefinitions = definitions.blocks as readonly BlockDefinition[];

export class ExampleExtension implements TurboWarpExtension {
  public constructor(private readonly scratch: ScratchApi) {}

  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: this.scratch.translate(definitions.extensionName),
      docsURI: extensionConfig.docsURI,
      blockIconURI: extensionConfig.blockIconURI,
      blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
    };
  }

  public hello(args: {NAME: unknown}): string {
    return this.scratch.translate(
      {
        default: 'Hello, {name}!',
        description: '{name} is replaced with the value supplied to the block.'
      },
      {name: this.scratch.Cast.toString(args.NAME)}
    );
  }

  private toScratchBlock(block: BlockDefinition): Record<string, unknown> {
    return {
      opcode: block.opcode,
      blockType: this.scratch.BlockType[block.blockType],
      text: this.scratch.translate(block.text),
      arguments: Object.fromEntries(
        Object.entries(block.arguments).map(([name, argument]) => [
          name,
          {
            type: this.scratch.ArgumentType[argument.type],
            defaultValue: argument.defaultValue
          }
        ])
      )
    };
  }
}
