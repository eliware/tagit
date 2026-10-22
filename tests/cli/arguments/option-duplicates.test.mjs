import { validateOptionDuplicates } from "../../../src/cli/arguments/option-duplicates.mjs";

test("rejects repeated command options", () => {
  expect(() => validateOptionDuplicates(["release", "--dry-run", "--dry-run"])).toThrow(
    "Duplicate option: --dry-run",
  );
  expect(() => validateOptionDuplicates(["release", "--ignore-100x4", "--ignore-100x4"])).toThrow(
    "Duplicate option: --ignore-100x4",
  );
  expect(() =>
    validateOptionDuplicates(["release", "--ignore-monolith-limits", "--ignore-monolith-limits"]),
  ).toThrow("Duplicate option: --ignore-monolith-limits");
});

test("rejects repeated version and help options", () => {
  expect(() => validateOptionDuplicates(["--version", "--version"])).toThrow(
    "Duplicate option: --version",
  );
  expect(() => validateOptionDuplicates(["--help", "-h"])).toThrow("Duplicate option: --help");
});

test("accepts a single option and an empty option set", () => {
  expect(() => validateOptionDuplicates(["release", "--dry-run"])).not.toThrow();
  expect(() => validateOptionDuplicates(["release"])).not.toThrow();
});
