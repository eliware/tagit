import validatePositionals from "../../../src/cli/arguments/positional-policy.mjs";

test.each([
  [["release", "--dry-run"], "release"],
  [["release", "--version", "1.2.3"], "release"],
  [["--version"], null],
])("accepts supported positional arguments %j", (argv, command) => {
  expect(() => validatePositionals(argv, command)).not.toThrow();
});

test("rejects unsupported positional arguments", () => {
  expect(() => validatePositionals(["release", "extra"], "release")).toThrow(
    "Unexpected positional",
  );
});
