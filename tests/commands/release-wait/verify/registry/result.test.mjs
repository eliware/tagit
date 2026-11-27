import createRegistryResult from "../../../../../src/commands/release-wait/verify/registry/result.mjs";

test("adds release fields to the registry result", () => {
  expect(
    createRegistryResult(
      { repo: "eliware/demo", tag: "v1.0.0", headSha: "abc" },
      { npm: true, ghcr: false },
    ),
  ).toEqual({
    repo: "eliware/demo",
    tag: "v1.0.0",
    headSha: "abc",
    ci: true,
    npm: true,
    ghcr: false,
  });
});
