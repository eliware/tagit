export function requirePublishJob(hasPassingPublishJob, { applicable, packageName, isPrivate }) {
  if (applicable && packageName && !isPrivate && !hasPassingPublishJob)
    throw new Error("Release CI lacks a passing publish job.");
}
