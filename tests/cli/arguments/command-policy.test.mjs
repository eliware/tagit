import { validateCommandPolicy } from "../../../src/cli/arguments/command-policy.mjs";

test.each([
  [["notes", "--ignore-100x4"], "notes", "requires preflight"],
  [["notes", "--ignore-monolith-limits"], "notes", "requires preflight"],
  [["notes", "--dry-run"], "notes", "requires push"],
  [["notes", "--version", "1.0.0"], "notes", "requires release"],
  [["release-wait", "--version", "1.0.0"], "release-wait", "latest tag"],
  [["release"], "release", "required"],
])("rejects options that violate command policy: %s", (argv, command, message) => {
  expect(() => validateCommandPolicy(argv, command)).toThrow(message);
});

test("accepts a release command with an exact version", () => {
  expect(() => validateCommandPolicy(["release", "--version", "1.2.3"], "release")).not.toThrow();
});
