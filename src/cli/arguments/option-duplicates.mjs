import { validateCommandOptionDuplicates } from "./option-duplicates/command.mjs";
import { validateHelpOptionDuplicates } from "./option-duplicates/help.mjs";
import { validateVersionOptionDuplicates } from "./option-duplicates/version.mjs";

export function validateOptionDuplicates(argv) {
  validateCommandOptionDuplicates(argv);
  validateVersionOptionDuplicates(argv);
  validateHelpOptionDuplicates(argv);
}
