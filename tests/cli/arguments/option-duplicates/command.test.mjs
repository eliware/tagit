import validateCommandOptionDuplicates from "../../../../src/cli/arguments/option-duplicates/command.mjs";

test("rejects a repeated dry-run option", () => {
  expect(() => validateCommandOptionDuplicates(["release", "--dry-run", "--dry-run"])).toThrow(
    "Duplicate option: --dry-run",
  );
});

test("accepts unique command options", () => {
  expect(() => validateCommandOptionDuplicates(["release", "--dry-run"])).not.toThrow();
  expect(() => validateCommandOptionDuplicates(["release"])).not.toThrow();
});
