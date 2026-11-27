import getIndentation from "./indentation.mjs";

export default function parseJobs(lines) {
  const jobs = new Map();
  for (let index = 0; index < lines.length; index += 1) {
    if (getIndentation(lines[index]) !== 2 || !lines[index].trimEnd().endsWith(":")) continue;
    const name = lines[index].trim().slice(0, -1);
    const end = lines.findIndex(
      (line, candidate) => candidate > index && getIndentation(line) === 2,
    );
    jobs.set(name, lines.slice(index + 1, end < 0 ? undefined : end));
  }
  return jobs;
}
