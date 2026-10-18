export function reportReleaseFailure(log, error, remoteSideEffects) {
  log.error(
    remoteSideEffects
      ? "Atomic release push failed. Check the remote branch and tag before retrying."
      : "Release tag operation failed before remote side effects.",
  );
  return error;
}
