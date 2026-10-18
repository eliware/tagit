export function verifyRemoteTag(remoteOutput, releaseTag, currentHead) {
  const lines = String(remoteOutput ?? "")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
  const peeledLine = lines.find((line) => line.endsWith(`refs/tags/${releaseTag}^{}`));
  const remoteHead = (peeledLine ?? lines[0] ?? "").split(/\s+/)[0];
  if (!/^[0-9a-f]{3,64}$/i.test(remoteHead) || remoteHead !== currentHead) {
    throw new Error(
      `Remote release tag ${releaseTag} does not resolve to the current commit ${currentHead}. Observed ${remoteHead || "none"}. Reconcile the remote tag before retrying.`,
    );
  }
  return remoteHead;
}
