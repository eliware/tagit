import { validateOptionDuplicates } from "../../../src/cli/arguments/option-duplicates.mjs";

test("coordinates the option duplicate policies", () => {
  expect(() =>
    validateOptionDuplicates([
      "release",
      "--dry-run",
      "--dry-run",
      "--version",
      "--version",
      "--help",
      "-h",
    ]),
  ).toThrow("Duplicate option: --dry-run");
  expect(() =>
    validateOptionDuplicates(["release", "--dry-run", "--version", "--help"]),
  ).not.toThrow();
});
