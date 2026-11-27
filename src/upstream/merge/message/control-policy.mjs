export default function hasUnsupportedControlCharacters(message) {
  return Array.from(message).some((character) => {
    const code = character.codePointAt(0);
    return code < 32 || code === 127;
  });
}
