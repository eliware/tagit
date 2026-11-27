import validateMergeMessage from "./validator.mjs";

export default function mergeMessage(args) {
  const message = args.join(" ");
  validateMergeMessage(message);
  return message;
}
