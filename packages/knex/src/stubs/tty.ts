import { createModuleStub } from '@nodeweb/utils';

export = createModuleStub({
  // Setting `isatty` to undefined prevents `knex` from calling it
  isatty: undefined,
});
