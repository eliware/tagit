import isCompleteReleaseCiPollResult from "../../../../../../src/commands/release-wait/release/ci/poll/result.mjs";

test("accepts completed results", () => {
  expect(isCompleteReleaseCiPollResult({ databaseId: 1 })).toBe(true);
});

test("keeps missing and pending results in the poll loop", () => {
  expect(isCompleteReleaseCiPollResult(null)).toBe(false);
  expect(isCompleteReleaseCiPollResult({ pending: true })).toBe(false);
});
