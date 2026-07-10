import {extensionConfig} from './config';

export class ExampleExtension implements TurboWarpExtension {
  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: extensionConfig.name,
      blocks: [
        {
          opcode: 'hello',
          blockType: Scratch.BlockType.REPORTER,
          text: 'hello [NAME]',
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
    return `Hello, ${Scratch.Cast.toString(args.NAME)}!`;
  }
}
