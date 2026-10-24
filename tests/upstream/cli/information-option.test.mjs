import { selectInformationOption } from "../../../src/upstream/cli/information-option.mjs";

test.each([
  ["--help", "help"],
  ["-h", "help"],
  ["--version", "version"],
  ["-v", "version"],
])("selects the information action for %s", (argument, expected) => {
  expect(selectInformationOption([argument])).toBe(expected);
});

test("rejects help and version options together", () => {
  expect(() => selectInformationOption(["--version", "--help"])).toThrow("must be used alone");
});

test("returns no information action for command arguments", () => {
  expect(selectInformationOption(["merge", "message"])).toBeNull();
});

test.each([
  ["--help", "merge"],
  ["--version", "merge"],
  ["--help", "--version"],
  ["-h", "--help"],
])("rejects information options mixed with other arguments: %j", (...args) => {
  expect(() => selectInformationOption(args)).toThrow("must be used alone");
});

test("rejects non-array upstream arguments", () => {
  expect(() => selectInformationOption("--help")).toThrow("must be an array");
});
