import createReleaseCiViewArgs from "../../../../../src/commands/release-wait/read/release-ci/view-command.mjs";

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
