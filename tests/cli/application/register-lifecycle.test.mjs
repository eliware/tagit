import { jest } from '@jest/globals';
import { registerLifecycle } from '../../../src/cli/application/register-lifecycle.mjs';
test('registers process lifecycle handlers with the logger', () => {
  const deps = { log: {}, registerHandlersFn: jest.fn(), registerSignalsFn: jest.fn() };
  registerLifecycle(deps);
  expect(deps.registerHandlersFn).toHaveBeenCalledWith({ log: deps.log });
  expect(deps.registerSignalsFn).toHaveBeenCalledWith({ log: deps.log });
});
