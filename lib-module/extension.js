import { extensionConfig } from './config.js';
import definitions from './block-definitions.json' with { type: 'json' };
const blockDefinitions = definitions.blocks;
export class ExampleExtension {
    constructor(scratch) {
        this.scratch = scratch;
    }
    getInfo() {
        return {
            id: extensionConfig.id,
            name: this.scratch.translate(definitions.extensionName),
            docsURI: extensionConfig.docsURI,
            blockIconURI: extensionConfig.blockIconURI,
            blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
        };
    }
    hello(args) {
        return this.scratch.translate({
            default: 'Hello, {name}!',
            description: '{name} is replaced with the value supplied to the block.'
        }, { name: this.scratch.Cast.toString(args.NAME) });
    }
    toScratchBlock(block) {
        return {
            opcode: block.opcode,
            blockType: this.scratch.BlockType[block.blockType],
            text: this.scratch.translate(block.text),
            arguments: Object.fromEntries(Object.entries(block.arguments).map(([name, argument]) => [
                name,
                {
                    type: this.scratch.ArgumentType[argument.type],
                    defaultValue: argument.defaultValue
                }
            ]))
        };
    }
}
