function indentation(line) {
  return line.length - line.trimStart().length;
}

function valueAfter(line, key) {
  const prefix = `${key}:`;
  const value = line.trimStart().replace(/^[-] /, "");
  return value.startsWith(prefix) ? value.slice(prefix.length).trim() : null;
}

export function parseWorkflow(text) {
  const lines = text
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trimStart().startsWith("#"));
  const sections = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    if (indentation(lines[index]) !== 0 || !lines[index].trimEnd().endsWith(":")) continue;
    const key = lines[index].trim().slice(0, -1);
    const end = lines.findIndex((line, candidate) => candidate > index && indentation(line) === 0);
    sections.set(key, lines.slice(index + 1, end < 0 ? undefined : end));
  }
  return sections;
}

export function parseJobs(lines) {
  const jobs = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    if (indentation(lines[index]) !== 2 || !lines[index].trimEnd().endsWith(":")) continue;
    const name = lines[index].trim().slice(0, -1);
    const end = lines.findIndex((line, candidate) => candidate > index && indentation(line) === 2);
    jobs.set(name, lines.slice(index + 1, end < 0 ? undefined : end));
  }
  return jobs;
}

export function hasTagTrigger(lines) {
  const tags = lines.findIndex((line) => valueAfter(line, "tags") !== null);
  return (
    tags >= 0 &&
    lines
      .slice(tags + 1)
      .some((line) =>
        ["- v[0-9]*.[0-9]*.[0-9]*"].includes(line.trim().replaceAll("'", "").replaceAll('"', "")),
      )
  );
}

export function hasMainPushTrigger(lines) {
  const push = lines.findIndex((line) => line.trim() === "push:");
  if (push < 0) return false;
  const end = lines.findIndex(
    (line, index) => index > push && indentation(line) <= indentation(lines[push]),
  );
  return lines
    .slice(push + 1, end < 0 ? undefined : end)
    .some((line) => /^\s*-\s*main\s*$/.test(line));
}

export function jobHasCommand(lines, command) {
  return lines.some((line) => valueAfter(line, "run") === command);
}

export function jobHasUse(lines, prefix) {
  return lines.some((line) => String(valueAfter(line, "uses")).startsWith(prefix));
}

export function jobValue(lines, key) {
  const line = lines.find((candidate) => valueAfter(candidate, key) !== null);
  return line ? valueAfter(line, key) : null;
}
