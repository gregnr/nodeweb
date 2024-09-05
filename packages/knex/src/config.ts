import { createModuleStub } from '@nodeweb/utils';

export type Config = {
  drivers: Partial<Drivers>;
};

export type Drivers = {
  pg: unknown;
  sqlite3: unknown;
  'better-sqlite3': unknown;
  mysql: unknown;
  mysql2: unknown;
  oracledb: unknown;
  tedious: unknown;
};

export const drivers: Drivers = {
  pg: createModuleStub({}, createFallback('pg')),
  sqlite3: createModuleStub({}, createFallback('sqlite3')),
  'better-sqlite3': createFallback('better-sqlite3'),
  mysql: createModuleStub({}, createFallback('mysql')),
  mysql2: createModuleStub({}, createFallback('mysql2')),
  oracledb: createModuleStub({}, createFallback('oracledb')),
  tedious: createModuleStub({}, createFallback('tedious')),
};

/**
 * Configures `Knex` module. Allows you to specify
 * which module is used for each database driver.
 *
 * @example
 * import { config } from '@nodeweb/knex/config';
 * import pg from '@nodeweb/pg';
 *
 * config({
 *   drivers: {
 *     pg,
 *   },
 * });
 */
export function config(config: Config) {
  Object.assign(drivers, config.drivers);
}

function createFallback(moduleName: string) {
  // Assume all fallback exports are either functions or classes
  return (_: unknown, property: string | symbol) =>
    new Proxy(
      // biome-ignore lint/complexity/useArrowFunction: allow function to be used as a constructor
      function () {
        throw new Error(
          `Module '${moduleName}' does not exist (trying to call '${String(property)}'). Did you forget to call config()?`,
        );
      },
      {
        construct() {
          throw new Error(
            `Module '${moduleName}' does not exist (trying to construct '${String(property)}'). Did you forget to call config()?`,
          );
        },
      },
    );
}
