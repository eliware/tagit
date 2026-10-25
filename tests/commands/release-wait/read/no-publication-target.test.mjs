import { noPublicationTarget } from "../../../../src/commands/release-wait/read/no-publication-target.mjs";

test("returns the empty publication target result", () => {
  expect(noPublicationTarget()).toEqual({
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: null,
  });
});
