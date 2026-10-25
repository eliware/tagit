import {
  createReleaseCiListArgs,
  createReleaseCiViewArgs,
} from "../../../../../src/commands/release-wait/read/release-ci/command.mjs";

test("builds arguments to list release CI runs", () => {
  expect(createReleaseCiListArgs("eliware/demo", "abc", ".github/workflows/ci.yaml")).toEqual([
    "run",
    "list",
    "--repo",
    "eliware/demo",
    "--commit",
    "abc",
    "--workflow",
    ".github/workflows/ci.yaml",
    "--limit",
    "1000",
    "--json",
    "databaseId,createdAt,headSha,headBranch",
  ]);
});

test("builds arguments to read release CI details", () => {
  expect(createReleaseCiViewArgs("eliware/demo", 7)).toEqual([
    "run",
    "view",
    "7",
    "--repo",
    "eliware/demo",
    "--json",
    "databaseId,status,conclusion,headSha,jobs,url",
  ]);
});
