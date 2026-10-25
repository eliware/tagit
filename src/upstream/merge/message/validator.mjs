export function validateMergeMessage(message) {
  const hasControlCharacter = Array.from(message).some((character) => {
    const code = character.codePointAt(0);
    return code < 32 || code === 127;
  });
  if (message.length > 500 || hasControlCharacter)
    throw new Error("Merge message contains unsupported control characters or is too long.");
}
