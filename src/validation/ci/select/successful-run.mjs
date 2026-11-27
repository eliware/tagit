export default function successfulRun(run) {
  return run?.status === "completed" && run.conclusion === "success" ? run : null;
}
