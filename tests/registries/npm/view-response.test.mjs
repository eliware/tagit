import { npmViewHasVersion } from "../../../src/registries/npm/view-response.mjs";

test.each([
  ['"1.0.0"', "1.0.0", true],
  ['["1.0.0"]', "1.0.0", true],
  ['["1.0.0", "1.0.1"]', "1.0.0", false],
  ['["1.0.1"]', "1.0.0", false],
  ['""', "1.0.0", false],
])("matches npm view output %s against version %s", (output, version, expected) => {
  expect(npmViewHasVersion(output, version)).toBe(expected);
});

test("rejects malformed npm view JSON", () => {
  expect(() => npmViewHasVersion("not-json", "1.0.0")).toThrow();
});
