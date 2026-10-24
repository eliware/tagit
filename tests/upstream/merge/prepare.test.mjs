import { prepareUpstreamMerge } from "../../../src/upstream/merge/prepare.mjs";

test("prepares an explicit merge message and dry-run option", () => {
  expect(prepareUpstreamMerge(["--dry-run", "sync"], new Date("2026-07-29T18:07:59Z"))).toEqual({
    dryRun: true,
    message: "sync",
  });
});

test("prepares a default timestamp message when no arguments are supplied", () => {
  expect(prepareUpstreamMerge([], new Date("2026-07-29T18:07:59Z"))).toEqual({
    dryRun: false,
    message: "2026-07-29 18:07:59",
  });
});
