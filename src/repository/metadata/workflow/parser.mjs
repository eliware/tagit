import getIndentation from "./indentation.mjs";

export default function parseWorkflow(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trimStart().startsWith("#"));
  const sections = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    if (getIndentation(lines[index]) !== 0 || !lines[index].trimEnd().endsWith(":")) continue;
    const key = lines[index].trim().slice(0, -1);
    const end = lines.findIndex(
      (line, candidate) => candidate > index && getIndentation(line) === 0,
    );
    sections.set(key, lines.slice(index + 1, end < 0 ? undefined : end));
  }
  return sections;
}
