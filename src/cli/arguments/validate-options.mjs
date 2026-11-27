import validateAllowedOptions from "./allowed-options.mjs";
import validateOptionDuplicates from "./option-duplicates.mjs";
import validateCommandPolicy from "./command-policy.mjs";
import validatePositionals from "./positional-policy.mjs";
import validateVersionPosition from "./version-position.mjs";
import validateHelpVersionPolicy from "./help-version-policy.mjs";

export default function validateOptions(argv, command) {
  validateAllowedOptions(argv);
  validateHelpVersionPolicy(argv);
  validateVersionPosition(argv, command);
  validatePositionals(argv, command);
  validateOptionDuplicates(argv);
  validateCommandPolicy(argv, command);
}
