function valueAfter(line, key) {
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(`${key}:`) ? value.slice(key.length + 1).trim() : null;
}

export default function jobValue(lines, key) {
  const line = lines.find((candidate) => valueAfter(candidate, key) !== null);
  return line ? valueAfter(line, key) : null;
}
