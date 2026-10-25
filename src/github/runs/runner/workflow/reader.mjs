function isMissingWorkflow(error, revision, workflowPath) {
  const details = `${error?.stderr ?? ""}\n${error?.stdout ?? ""}\n${error?.message ?? ""}`;
  return details.includes(`fatal: path '${workflowPath}' does not exist in '${revision}'`);
}

export function readWorkflowContentsFromGit(execFileSync, revision, workflowPaths) {
  const contentsByPath = Object.create(null);
  for (const workflowPath of workflowPaths) {
    try {
      contentsByPath[workflowPath] = execFileSync("git", ["show", `${revision}:${workflowPath}`], {
        encoding: "utf8",
      });
    } catch (error) {
      if (!isMissingWorkflow(error, revision, workflowPath)) throw error;
    }
  }
  return contentsByPath;
}
