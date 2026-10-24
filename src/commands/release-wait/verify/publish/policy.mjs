export function requirePublishJob(publishJobs, { applicable, packageName, isPrivate }) {
  if (applicable && packageName && !isPrivate && !publishJobs.length)
    throw new Error("Release CI lacks a passing publish job.");
}
