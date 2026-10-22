import { jest } from "@jest/globals";
import { readCiRuns } from "../../../../src/github/links/read/ci-run-links.mjs";

test("reads and filters exact-head CI runs", () => {
  const exec = jest.fn(() =>
    JSON.stringify([
      { databaseId: 1, url: "run", headSha: "abc" },
      { databaseId: 2, url: "other", headSha: "def" },
    ]),
  );
  expect(readCiRuns(exec, "eliware/demo", "abc")).toEqual([
    { databaseId: 1, url: "run", headSha: "abc" },
  ]);
});

test("rejects a response that does not contain a run array", () => {
  expect(() =>
    readCiRuns(
      jest.fn(() => JSON.stringify({ runs: [] })),
      "eliware/demo",
      "abc",
    ),
  ).toThrow("must be an array");
});
