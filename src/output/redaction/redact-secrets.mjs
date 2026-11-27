import { redactText } from "@eliware/common";

export default function redactSecrets(output) {
  return redactText(output, { maxString: 10000 });
}
