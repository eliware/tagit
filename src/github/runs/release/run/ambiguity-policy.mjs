export function assertUnambiguousReleaseRunTimestamps(eligibleRuns, tag) {
  if (
    eligibleRuns.length > 1 &&
    eligibleRuns.some((item) => !item.createdAt) &&
    eligibleRuns.some((item) => item.createdAt)
  )
    throw new Error(
      `Release CI data is ambiguous because eligible runs do not have creation timestamps for ${tag}.`,
    );
}
