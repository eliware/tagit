import { selectInformationOption } from "../../../src/upstream/cli/information-option.mjs";

test.each([
  ["--help", "help"],
  ["-h", "help"],
  ["--version", "version"],
  ["-v", "version"],
])("selects the information action for %s", (argument, expected) => {
  expect(selectInformationOption([argument])).toBe(expected);
});

test("prefers help when help and version options appear together", () => {
  expect(selectInformationOption(["--version", "--help"])).toBe("help");
});

test("returns no information action for command arguments", () => {
  expect(selectInformationOption(["merge", "message"])).toBeNull();
});
