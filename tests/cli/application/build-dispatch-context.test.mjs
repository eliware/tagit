import { buildDispatchContext } from '../../../src/cli/application/build-dispatch-context.mjs';

test('projects the public dispatch context and excludes unrelated dependencies', () => {
  const value = { fs: {}, log: {}, packageVersion: '1.0.0', unrelated: true };
  expect(buildDispatchContext(value)).toEqual(expect.objectContaining({ fs: value.fs, packageVersion: '1.0.0' }));
  expect(buildDispatchContext(value)).not.toHaveProperty('unrelated');
});
