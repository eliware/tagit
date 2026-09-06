import { testWaiverArguments } from '../../../src/validation/local/test-waiver-arguments.mjs';
test('forwards only explicitly requested waivers', () =>
  expect(testWaiverArguments({ ignore100x4: true })).toEqual(['--', '--ignore-100x4']));
test('defaults to no waivers', () => expect(testWaiverArguments()).toEqual([]));
