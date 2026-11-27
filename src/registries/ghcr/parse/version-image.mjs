import hasVersionTag from "../verify/version-tag.mjs";

export default function findGhcrVersionImage(versions, version) {
  return versions.find((item) => hasVersionTag(item, `v${version}`)) ?? null;
}
