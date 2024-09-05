/**
 * Creates a module stub using the provided `exports` object
 * and a `fallback`.
 *
 * The `fallback` will be called for any property (export) accessed
 * at runtime that doesn't exist in `exports`. The default `fallback`
 * will return a function that throws a "not implemented" error.
 *
 * Useful for stubbing native Node modules (eg. fs) without implementing
 * every export within it.
 */
export function createModuleStub<T extends Record<string, unknown>>(
  exports: T,
  fallback: (target: T, property: string | symbol) => unknown = createUnimplementedFallback(),
) {
  return new Proxy(exports, {
    get(target, property) {
      if (property in target) {
        return target[property as keyof typeof target];
      }
      return fallback(target, property);
    },
  });
}

/**
 * Creates a `Proxy` that represents a module with exports as properties.
 *
 * All properties are assumed to be functions or classes, and calling them
 * will throw a "not implemented" error.
 */
export function createUnimplementedFallback() {
  return (_: unknown, property: string | symbol) =>
    // Assume all fallback exports are either functions or classes by default
    new Proxy(
      // biome-ignore lint/complexity/useArrowFunction: allow function to be used as a constructor
      function () {
        throw new Error(`Function '${String(property)}' is not implemented in this build.`);
      },
      {
        construct() {
          throw new Error(`Class '${String(property)}' is not implemented in this build.`);
        },
      },
    );
}
