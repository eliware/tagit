function indentation(line) {
  return line.length - line.trimStart().length;
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
