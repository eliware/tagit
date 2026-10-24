import { verifyRemoteTag } from "../tags/verify-remote-tag.mjs";

export function verifyPushedTag(git, releaseTag, currentHead) {
  const remoteOutput = git(
    ["ls-remote", "--tags", "origin", `refs/tags/${releaseTag}`, `refs/tags/${releaseTag}^{}`],
    { encoding: "utf8" },
  );
  return verifyRemoteTag(String(remoteOutput ?? ""), releaseTag, currentHead);
}
