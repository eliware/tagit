import isHelp from "../../../../src/cli/arguments/parse/is-help.mjs";

test.each([
  [["--help"], true],
  [["-h"], true],
  [["preflight"], false],
])("detects help arguments %p", (argv, expected) => {
  expect(isHelp(argv)).toBe(expected);
});
