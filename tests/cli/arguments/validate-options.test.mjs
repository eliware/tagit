import { validateOptions } from "../../../src/cli/arguments/validate-options.mjs";

test("accepts valid command options", () => {
  expect(() => validateOptions(["release", "--version", "1.2.3"], "release")).not.toThrow();
});

test("rejects a value after commandless version query", () => {
  expect(() => validateOptions(["--version", "1.2.3"], null)).toThrow(
    "version query does not accept",
  );
});

test("rejects combined help and version options", () => {
  expect(() => validateOptions(["--help", "--version"], null)).toThrow("cannot be combined");
});
