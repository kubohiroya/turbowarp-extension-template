import {extensionConfig} from './config';
import {ExampleExtension} from './extension';

(function registerExtension(ScratchApi: ScratchApi): void {
  'use strict';

  if (extensionConfig.unsandboxed && !ScratchApi.extensions.unsandboxed) {
    throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  }

  ScratchApi.extensions.register(new ExampleExtension());
})(Scratch);
