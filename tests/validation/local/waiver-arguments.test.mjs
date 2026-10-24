import { testWaiverArguments } from "../../../src/validation/local/waiver-arguments.mjs";

test.each([
  [undefined, []],
  [{}, []],
  [{ ignore100x4: true }, ["--", "--ignore-100x4"]],
  [{ ignoreMonolithLimits: true }, ["--", "--ignore-monolith-limits"]],
  [
    { ignore100x4: true, ignoreMonolithLimits: true },
    ["--", "--ignore-100x4", "--ignore-monolith-limits"],
  ],
])("maps requested test waivers to arguments: %j", (options, expected) => {
  expect(testWaiverArguments(options)).toEqual(expected);
});
