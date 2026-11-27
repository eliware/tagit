import validateVersionPosition from "../../../src/cli/arguments/version-position.mjs";

test.each([
  [["release", "--version", "1.2.3"], "release"],
  [["--version"], null],
  [["release", "--dry-run"], "release"],
])("accepts supported version positions %j", (argv, command) => {
  expect(() => validateVersionPosition(argv, command)).not.toThrow();
});

test.each([
  [["release", "--version"], "release", "value is required"],
  [["release", "--version", "--dry-run"], "release", "value is required"],
  [["--version", "1.2.3"], null, "does not accept a value"],
])("rejects unsupported version positions %j", (argv, command, message) => {
  expect(() => validateVersionPosition(argv, command)).toThrow(message);
});
