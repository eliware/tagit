import { validateAllowedOptions } from "./allowed-options.mjs";
import { validateOptionDuplicates } from "./option-duplicates.mjs";
import { validateCommandPolicy } from "./command-policy.mjs";
import { validatePositionals } from "./positional-policy.mjs";

export function validateOptions(argv, command) {
  validateAllowedOptions(argv);
  if (
    argv.some((argument) => ["--help", "-h"].includes(argument)) &&
    argv.some((argument) => ["--version", "-v"].includes(argument))
  )
    throw new Error("Help and version options cannot be combined.");
  validatePositionals(argv, command);
  validateOptionDuplicates(argv);
  validateCommandPolicy(argv, command);
}
