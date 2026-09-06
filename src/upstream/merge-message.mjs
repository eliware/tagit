export function mergeMessage(args = [], now = new Date()) {
  const message = args.length ? args.join(' ') : now.toISOString().replace('T', ' ').slice(0, 19);
  const hasControlCharacter = Array.from(message).some((character) => {
    const code = character.codePointAt(0);
    return code < 32 || code === 127;
  });
  if (message.length > 500 || hasControlCharacter)
    throw new Error('Merge message contains unsupported control characters or is too long.');
  return message;
}
