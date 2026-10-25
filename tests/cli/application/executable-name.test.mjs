import { normalizeCliExecutableName } from "../../../src/cli/application/executable-name.mjs";

test.each([
  ["/opt/tagit/bin/tagit.mjs", "tagit.mjs"],
  ["C:\\tools\\tagit.exe", "tagit.exe"],
  ["", ""],
])("normalizes executable path %s", (value, expected) => {
  expect(normalizeCliExecutableName(value)).toBe(expected);
});
