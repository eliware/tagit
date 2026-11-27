import buildReleaseCiArgs from "../../../../../src/commands/release-wait/read/release-ci/command.mjs";

test("builds arguments to list release CI runs", () => {
  expect(
    buildReleaseCiArgs("eliware/demo", {
      action: "list",
      headSha: "abc",
      workflowPath: ".github/workflows/ci.yaml",
    }),
  ).toEqual([
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
  expect(buildReleaseCiArgs("eliware/demo", { action: "view", databaseId: 7 })).toEqual([
    "run",
    "view",
    "7",
    "--repo",
    "eliware/demo",
    "--json",
    "databaseId,status,conclusion,headSha,jobs,url",
  ]);
});
