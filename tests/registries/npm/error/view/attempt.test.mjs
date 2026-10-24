import { classifyNpmViewAttempt } from "../../../../../src/registries/npm/error/view/attempt.mjs";

test("classifies an available npm view result", () => {
  expect(
    classifyNpmViewAttempt({
      output: '"1.0.0"',
      version: "1.0.0",
    }),
  ).toEqual({ type: "result", exists: true });
});

test("classifies a missing version", () => {
  expect(
    classifyNpmViewAttempt({
      output: '"0.9.0"',
      version: "1.0.0",
    }),
  ).toEqual({ type: "result", exists: false });
});

test("classifies command failures without reporting them", () => {
  const error = { code: "EAI_AGAIN" };
  expect(classifyNpmViewAttempt({ error })).toEqual({ type: "failure", error });
});
