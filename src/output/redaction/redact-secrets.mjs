import { redactText } from "@eliware/common";

export function redactSecrets(output) {
  return redactText(output, { maxString: 10000 });
}
