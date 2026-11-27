export default function isCompleteReleaseCiPollResult(result) {
  return Boolean(result && !result.pending);
}
