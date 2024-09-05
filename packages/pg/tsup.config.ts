import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';

const require = createRequire(import.meta.url);

const genericStub = require.resolve('@nodeweb/utils/stubs/generic');
const eventsPolyfill = require.resolve('@nodeweb/utils/polyfills/events');
const bufferGlobal = require.resolve('@nodeweb/utils/globals/buffer');

export default defineConfig({
  entry: ['src/index.ts', 'src/socket.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  sourcemap: true,
  dts: true,
  minify: false,
  splitting: true,
  esbuildOptions(options) {
    options.alias = {
      // Stubs
      net: genericStub,
      dns: genericStub,
      crypto: genericStub,

      // Polyfills
      events: eventsPolyfill,
      'node:events': eventsPolyfill,
    };
    options.define = {
      global: 'globalThis',
    };
    options.inject = [bufferGlobal];
  },
});
