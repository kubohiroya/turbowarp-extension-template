import { extensionConfig } from './config.js';
import { ExampleExtension } from './extension.js';
/** Readable before any host API is available. */
export const bundleModuleMetadata = Object.freeze({
    formatVersion: 1,
    id: extensionConfig.id,
    unsandboxed: extensionConfig.unsandboxed ? 'required' : 'not-needed'
});
/** The caller owns initialization order and registration; this function does not register. */
export function createExtension(scratch) {
    return new ExampleExtension(scratch);
}
