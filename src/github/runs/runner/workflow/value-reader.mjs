export function readRunnerValueDeclaration(jobLines) {
  const index = jobLines.findIndex((line) => /^\s*runs-on\s*:/.test(line));
  if (index < 0) return null;
  const line = jobLines[index];
  const indent = line.length - line.trimStart().length;
  const value = line.trim().replace(/^runs-on\s*:\s*/, "");
  if (value) return { value, blockLines: [] };

  const blockLines = [];
  for (const next of jobLines.slice(index + 1)) {
    if (next.length - next.trimStart().length <= indent) break;
    blockLines.push(next);
  }
  return { value, blockLines };
}
