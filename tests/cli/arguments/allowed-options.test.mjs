import { validateAllowedOptions } from "../../../src/cli/arguments/allowed-options.mjs";

test("rejects an option outside the allowed vocabulary", () => {
  expect(() => validateAllowedOptions(["release", "--bad"])).toThrow("Unknown option: --bad");
});

test("accepts supported options and positional values", () => {
  expect(() => validateAllowedOptions(["release", "--dry-run", "1.2.3"])).not.toThrow();
});
