import { validateHelpOptionDuplicates } from "../../../../src/cli/arguments/option-duplicates/help.mjs";

test("rejects repeated help aliases", () => {
  expect(() => validateHelpOptionDuplicates(["--help", "-h"])).toThrow("Duplicate option: --help");
});

test("accepts one help option", () => {
  expect(() => validateHelpOptionDuplicates(["--help"])).not.toThrow();
  expect(() => validateHelpOptionDuplicates(["-h"])).not.toThrow();
});
