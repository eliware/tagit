import { classifyNpmViewFailure } from "../../../../../../src/registries/npm/error/view/result/failure-policy.mjs";

test("returns the command failure without changing its error", () => {
  const error = { code: "EAI_AGAIN" };
  expect(classifyNpmViewFailure({ error })).toEqual({ type: "failure", error });
});

test("returns null when the npm command succeeds", () => {
  expect(classifyNpmViewFailure({ output: '"1.0.0"', version: "1.0.0" })).toBeNull();
});
