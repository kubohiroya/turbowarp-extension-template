import {extensionConfig} from './config.js';
import {ExampleExtension} from './extension.js';

if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) {
  throw new Error(`${extensionConfig.name} must run unsandboxed.`);
}

const extension = new ExampleExtension();
Scratch.extensions.register(extension);
extension.initializeBlockEditors();

// A sandbox worker has no window. Preserve registrations across bfcache restores.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', (event) => {
    if (!event.persisted) extension.dispose();
  });
}
