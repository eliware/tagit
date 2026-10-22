import {
  validateAllowedOptions,
  validateOptionDuplicates,
} from "../../../src/cli/arguments/option-policy.mjs";

test("validates option vocabulary and duplicate options", () => {
  expect(() => validateAllowedOptions(["release", "--bad"])).toThrow("Unknown option");
  expect(() => validateOptionDuplicates(["release", "--dry-run", "--dry-run"])).toThrow(
    "Duplicate",
  );
});
