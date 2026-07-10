import {extensionConfig} from './config';
import definitions from './block-definitions.json';

type BlockDefinition = (typeof definitions.blocks)[number];

export class ExampleExtension implements TurboWarpExtension {
  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: Scratch.translate(definitions.extensionName),
      blocks: definitions.blocks.map((block) => this.toScratchBlock(block))
    };
  }

  public hello(args: {NAME: unknown}): string {
    return Scratch.translate(
      {
        default: 'Hello, {name}!',
        description: '{name} is replaced with the value supplied to the block.'
      },
      {name: Scratch.Cast.toString(args.NAME)}
    );
  }

  private toScratchBlock(block: BlockDefinition): Record<string, unknown> {
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
