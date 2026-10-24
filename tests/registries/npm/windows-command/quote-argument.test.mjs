import { quoteWindowsNpmArgument } from "../../../../src/registries/npm/windows-command/quote-argument.mjs";

test.each([
  ["view", '"view"'],
  ["@eliware/test@8.0.0", '"@eliware/test@8.0.0"'],
  ["--json", '"--json"'],
])("quotes Windows npm argument %s", (argument, expected) => {
  expect(quoteWindowsNpmArgument(argument)).toBe(expected);
});
