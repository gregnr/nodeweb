import type { Plugin } from 'esbuild';

/**
 * esbuild plugin that allows you to replace internal file
 * resolutions from within modules.
 *
 * Similar to `alias`, but works internally within a module.
 */
export function internalResolutionPlugin(filter: RegExp, path: string): Plugin {
  return {
    name: 'internal-resolution-plugin',
    setup(build) {
      build.onResolve({ filter }, () => {
        return { path };
      });
    },
  };
}
