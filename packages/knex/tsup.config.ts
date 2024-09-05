import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';
import { internalResolutionPlugin } from '@nodeweb/utils/esbuild';

const require = createRequire(import.meta.url);

const genericStub = require.resolve('@nodeweb/utils/stubs/generic');
const eventsPolyfill = require.resolve('@nodeweb/utils/polyfills/events');
const utilPolyfill = require.resolve('@nodeweb/utils/polyfills/util');
const timersPolyfill = require.resolve('@nodeweb/utils/polyfills/timers');
const bufferGlobal = require.resolve('@nodeweb/utils/globals/buffer');

export default defineConfig({
  entry: ['src/index.ts', 'src/config.ts'],
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
      url: genericStub,
      assert: genericStub,
      fs: genericStub,
      path: genericStub,
      os: genericStub,
      tty: './src/stubs/tty.ts',

      // Polyfills
      events: eventsPolyfill,
      util: utilPolyfill,
      timers: timersPolyfill,

      // Custom DB driver handling
      pg: './src/drivers/pg.ts',
      sqlite3: './src/drivers/sqlite3.ts',
      'better-sqlite3': './src/drivers/better-sqlite3.ts',
      mysql: './src/drivers/mysql.ts',
      mysql2: './src/drivers/mysql2.ts',
      oracledb: './src/drivers/oracledb.ts',
      tedious: './src/drivers/tedious.ts',
    };
    options.define = {
      global: 'globalThis',
      'process.browser': 'true',
    };
    options.inject = [bufferGlobal];
  },
  esbuildPlugins: [
    // Stub all Knex migration/seed logic (files under ./lib/migrations)
    // since these heavily rely on the FS
    internalResolutionPlugin(/migrations\//, genericStub),
  ],
});
