export function buildCompletedRunResult(data, headSha, policy) {
  return {
    passed:
      !policy.failed &&
      data.status === "completed" &&
      data.conclusion === "success" &&
      data.headSha === headSha &&
      policy.ubuntu &&
      policy.windows.passed,
    platforms: policy.windows.successful ? "Ubuntu and Windows passed" : "Ubuntu passed",
    policy,
  };
}
