import type { ScratchApi, TurboWarpExtension } from './runtime-api.js';
export declare class ExampleExtension implements TurboWarpExtension {
    private readonly scratch;
    constructor(scratch: ScratchApi);
    getInfo(): Record<string, unknown>;
    hello(args: {
        NAME: unknown;
    }): string;
    private toScratchBlock;
}
