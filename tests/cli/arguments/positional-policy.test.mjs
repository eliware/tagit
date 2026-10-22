import { validatePositionals } from "../../../src/cli/arguments/positional-policy.mjs";

test.each([
  [["release", "--version", "1.2.3"], "release"],
  [["--version"], null],
  [["release", "--dry-run"], "release"],
])("accepts supported positional arguments %j", (argv, command) => {
  expect(() => validatePositionals(argv, command)).not.toThrow();
});

test.each([
  [["release", "extra"], "release", "Unexpected positional"],
  [["release", "--version"], "release", "value is required"],
  [["release", "--version", "--dry-run"], "release", "value is required"],
  [["--version", "1.2.3"], null, "does not accept a value"],
])("rejects unsupported positional arguments %j", (argv, command, message) => {
  expect(() => validatePositionals(argv, command)).toThrow(message);
});
