import { validateCommandOptionDuplicates } from "../../../../src/cli/arguments/option-duplicates/command.mjs";

test.each(["--dry-run", "--ignore-100x4", "--ignore-monolith-limits"])(
  "rejects a repeated command option %s",
  (option) => {
    expect(() => validateCommandOptionDuplicates(["release", option, option])).toThrow(
      `Duplicate option: ${option}`,
    );
  },
);

test("accepts unique command options", () => {
  expect(() => validateCommandOptionDuplicates(["release", "--dry-run"])).not.toThrow();
  expect(() => validateCommandOptionDuplicates(["release"])).not.toThrow();
});
