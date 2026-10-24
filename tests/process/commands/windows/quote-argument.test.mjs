import { quoteWindowsArgument } from "../../../../src/process/commands/windows/quote-argument.mjs";

test.each([
  ["view", '"view"'],
  ["@eliware/test@8.0.0", '"@eliware/test@8.0.0"'],
  ["--json", '"--json"'],
])("quotes a Windows command argument %s", (argument, expected) => {
  expect(quoteWindowsArgument(argument)).toBe(expected);
});
