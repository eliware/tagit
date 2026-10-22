import { validateHelpVersionPolicy } from "../../../src/cli/arguments/help-version-policy.mjs";

test.each([
  ["--help", "--version"],
  ["-h", "-v"],
  ["--help", "-v"],
  ["-h", "--version"],
])("rejects combined help and version options: %j", (...argv) => {
  expect(() => validateHelpVersionPolicy(argv)).toThrow("cannot be combined");
});

test.each([["--help"], ["--version"], []])(
  "accepts separate help or version options: %j",
  (...argv) => {
    expect(() => validateHelpVersionPolicy(argv)).not.toThrow();
  },
);
