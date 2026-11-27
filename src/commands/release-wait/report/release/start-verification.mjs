import reportReleaseStart from "./start.mjs";

export default async function reportReleaseVerificationStart(options) {
  const { repo, tag, headSha } = options;
  const { ciRunId, publishRunId } = await reportReleaseStart(options);
  return { repo, tag, headSha, ciRunId, publishRunId, linksOnly: true };
}
