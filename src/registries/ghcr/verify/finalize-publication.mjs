import { imageDigest } from "./digest.mjs";
import { requireExpectedDigest } from "./expected-digest-policy.mjs";
import { reportGhcrPublication } from "./report-publication.mjs";

export function finalizeGhcrPublication(log, repository, version, expectedDigest, image) {
  const digest = imageDigest(image);
  requireExpectedDigest(digest, expectedDigest, repository, version);
  reportGhcrPublication(log, repository, version, digest);
  return { imageDigest: digest };
}
