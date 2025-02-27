import { createModuleStub } from '@nodeweb/utils';

export = createModuleStub({
  // Setting `webcrypto` to undefined prevents `pg` from calling it
  webcrypto: undefined,
});
