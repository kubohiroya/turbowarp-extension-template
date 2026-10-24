import { ExampleExtension } from './extension.js';
import type { ExtensionModuleMetadata, ScratchApi } from './runtime-api.js';
export type { ExtensionModuleMetadata, ScratchApi, ScratchTranslate, TurboWarpExtension } from './runtime-api.js';
/** Readable before any host API is available. */
export declare const bundleModuleMetadata: ExtensionModuleMetadata;
/** The caller owns initialization order and registration; this function does not register. */
export declare function createExtension(scratch: ScratchApi): ExampleExtension;
