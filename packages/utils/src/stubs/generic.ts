import { createModuleStub } from '../';

/**
 * Generic stub that can be used by any module that
 * doesn't need to handle specific exports.
 *
 * Under the hood this uses a `Proxy` to catch-all
 * exports and returns a function that throws a
 * "not implemented" error.
 */
export = createModuleStub({});
