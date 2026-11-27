export default function showUpstreamHelp(log) {
  log.log(
    "Usage: upstream [--dry-run] [merge-message...]\nFetch upstream, merge its default branch, and push the result.\nLimit merge messages to 500 characters. Do not use control characters.",
  );
}
