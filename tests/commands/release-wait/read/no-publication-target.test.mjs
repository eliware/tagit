import { noPublicationTarget } from "../../../../src/commands/release-wait/read/no-publication-target.mjs";
import { readPublicationTarget } from "../../../../src/commands/release-wait/read/publication-target.mjs";

test("returns the empty publication target result", () => {
  expect(noPublicationTarget()).toEqual({
    applicable: false,
    ghcrApplicable: false,
    workflows: [],
    packageName: null,
    isPrivate: null,
  });
});

test("selects the empty result when package data is absent", () => {
  expect(readPublicationTarget({ existsSync: () => false })).toEqual(noPublicationTarget());
});
