import {extensionConfig} from './config.js';
import {ExampleExtension} from './extension.js';
import type {ExtensionModuleMetadata, ScratchApi} from './runtime-api.js';

export type {
  ExtensionModuleMetadata,
  ScratchApi,
  ScratchTranslate,
  TurboWarpExtension
} from './runtime-api.js';

/** Readable before any host API is available. */
export const bundleModuleMetadata: ExtensionModuleMetadata = Object.freeze({
  formatVersion: 1,
  id: extensionConfig.id,
  unsandboxed: extensionConfig.unsandboxed ? 'required' : 'not-needed'
});

/** The caller owns initialization order and registration; this function does not register. */
export function createExtension(scratch: ScratchApi): ExampleExtension {
  return new ExampleExtension(scratch);
}
