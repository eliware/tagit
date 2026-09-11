export function reportReleaseFailure(log, error, remoteSideEffects) {
  log.error(
    remoteSideEffects
      ? 'Tag push failed after remote side effects; local files were preserved for reconciliation.'
      : 'Release tag operation failed before remote side effects.',
  );
  return error;
}
