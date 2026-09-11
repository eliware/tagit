import { preflightOptions } from '../../../src/commands/release/preflight-options.mjs';

test('maps release waiver options to preflight options', () => {
  expect(preflightOptions({ ignore100x4: true, ignoreMonolithLimits: false })).toEqual({
    ignore100x4: true,
    ignoreMonolithLimits: false,
    report: true,
  });
  expect(preflightOptions({ ignore100x4: false, ignoreMonolithLimits: true }, false)).toEqual({
    ignore100x4: false,
    ignoreMonolithLimits: true,
    report: false,
  });
});
