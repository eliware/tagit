import hasUnsupportedControlCharacters from "./control-policy.mjs";
import isValidMergeMessageLength from "./length-policy.mjs";

export default function validateMergeMessage(message) {
  if (!isValidMergeMessageLength(message) || hasUnsupportedControlCharacters(message))
    throw new Error("Merge message contains unsupported control characters or is too long.");
}
