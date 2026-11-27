import selectLatestRun from "../../../../src/validation/ci/select/run.mjs";

test("selects the newest exact-head run", () => {
  expect(
    selectLatestRun(
      [
        { databaseId: 1, headSha: "abc" },
        { databaseId: 2, headSha: "abc" },
        { databaseId: 9, headSha: "old" },
      ],
      "abc",
    ).databaseId,
  ).toBe(2);
});
