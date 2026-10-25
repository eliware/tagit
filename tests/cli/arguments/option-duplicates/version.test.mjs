import { validateVersionOptionDuplicates } from "../../../../src/cli/arguments/option-duplicates/version.mjs";

test("rejects repeated version options", () => {
  expect(() => validateVersionOptionDuplicates(["--version", "--version"])).toThrow(
    "Duplicate option: --version",
  );
});

test("accepts one version option", () => {
  expect(() => validateVersionOptionDuplicates(["--version"])).not.toThrow();
});
