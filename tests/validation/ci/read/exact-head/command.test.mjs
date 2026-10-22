import { buildExactHeadRunCommand } from "../../../../../src/validation/ci/read/exact-head/command.mjs";

test("builds a list command for an exact commit", () => {
  expect(buildExactHeadRunCommand("abc", "eliware/demo", null)).toEqual({
    repoArg: ["--repo", "eliware/demo"],
    args: [
      "run",
      "list",
      "--commit",
      "abc",
      "--repo",
      "eliware/demo",
      "--limit",
      "1000",
      "--json",
      "databaseId,status,conclusion,headSha,url",
    ],
  });
});

test("builds a view command for a selected run without a repository", () => {
  expect(buildExactHeadRunCommand("abc", null, { databaseId: 2 })).toEqual({
    repoArg: [],
    args: ["run", "view", "2", "--json", "databaseId,status,conclusion,headSha,url"],
  });
});
