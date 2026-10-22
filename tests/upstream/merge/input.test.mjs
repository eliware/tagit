import { readUpstreamMergeInput } from "../../../src/upstream/merge/input.mjs";

test("reads dry-run arguments and builds the merge message", () => {
  expect(
    readUpstreamMergeInput(["--dry-run", "sync", "upstream"], new Date("2026-10-22T12:00:00Z")),
  ).toEqual({
    dryRun: true,
    message: "sync upstream",
  });
});

test("uses the current time when no merge message is supplied", () => {
  expect(readUpstreamMergeInput([], new Date("2026-10-22T12:00:00Z"))).toEqual({
    dryRun: false,
    message: "2026-10-22 12:00:00",
  });
});

test("rejects invalid upstream argument input", () => {
  expect(() => readUpstreamMergeInput("sync", new Date("2026-10-22T12:00:00Z"))).toThrow(
    "Upstream arguments must be an array.",
  );
});
