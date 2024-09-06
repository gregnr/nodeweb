import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: [
      'src/index.ts',
      'src/esbuild.ts',
      'src/globals/buffer.ts',
      'src/stubs/generic.ts',
      'src/polyfills/events.ts',
      'src/polyfills/timers.ts',
      'src/polyfills/util.ts',
    ],
    format: ['esm', 'cjs'],
    outDir: 'dist',
    sourcemap: true,
    dts: true,
    minify: false,
    splitting: false,
    esbuildOptions(options) {
      options.alias = {
        // 'timers' polyfill imports 'assert' and 'util'
        assert: './src/stubs/generic.ts',
        util: './src/polyfills/util.ts',
      };
    },
  },
]);
