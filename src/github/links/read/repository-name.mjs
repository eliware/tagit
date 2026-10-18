export function readRepositoryName(execFileSync) {
  const remote = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
  const match = remote.match(
    /^(?:https?:\/\/github\.com\/|git@github\.com:)([^/]+\/[^/]+?)(?:\.git)?$/i,
  );
  if (!match) throw new Error(`Cannot determine the GitHub repository from the remote: ${remote}`);
  return match[1];
}
