import { jest } from "@jest/globals";
import { verifyCiCandidates } from "../../../../src/validation/ci/verify/candidates.mjs";

test("returns the first passing candidate result", () => {
  const candidates = [{ databaseId: 1 }, { databaseId: 2 }];
  const verifyRun = jest.fn((_exec, _log, run) => (run.databaseId === 2 ? "verified" : null));
  expect(verifyCiCandidates(jest.fn(), {}, candidates, "abc", {}, verifyRun)).toBe("verified");
  expect(verifyRun).toHaveBeenCalledTimes(2);
});

test("returns null when no candidate passes", () => {
  const verifyRun = jest.fn(() => null);
  expect(verifyCiCandidates(jest.fn(), {}, [{ databaseId: 1 }], "abc", {}, verifyRun)).toBeNull();
});
