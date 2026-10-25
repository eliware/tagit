export function requirePublishJob(hasPassingPublishJob) {
  if (!hasPassingPublishJob) throw new Error("Release CI lacks a passing publish job.");
}
