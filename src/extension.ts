import {extensionConfig} from './config';

export class ExampleExtension implements TurboWarpExtension {
  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: Scratch.translate(extensionConfig.name),
      blocks: [
        {
          opcode: 'hello',
          blockType: Scratch.BlockType.REPORTER,
          text: Scratch.translate('hello [NAME]'),
          arguments: {
            NAME: {
              type: Scratch.ArgumentType.STRING,
              defaultValue: 'world'
            }
          }
        }
      ]
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
}
