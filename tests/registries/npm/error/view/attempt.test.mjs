import { jest } from "@jest/globals";

const readNpmViewResponse = jest.fn();
const classifyNpmViewAvailability = jest.fn();
const classifyNpmViewFailure = jest.fn();
jest.unstable_mockModule(
  "../../../../../src/registries/npm/error/view/result/response-reader.mjs",
  () => ({ readNpmViewResponse }),
);
jest.unstable_mockModule(
  "../../../../../src/registries/npm/error/view/result/availability-policy.mjs",
  () => ({ classifyNpmViewAvailability }),
);
jest.unstable_mockModule(
  "../../../../../src/registries/npm/error/view/result/failure-policy.mjs",
  () => ({
    classifyNpmViewFailure,
  }),
);
const { classifyNpmViewAttempt } =
  await import("../../../../../src/registries/npm/error/view/attempt.mjs");

beforeEach(() => {
  jest.clearAllMocks();
  classifyNpmViewFailure.mockReturnValue(null);
});

test("coordinates response reading and availability classification", () => {
  readNpmViewResponse.mockReturnValue("1.0.0");
  classifyNpmViewAvailability.mockReturnValue("available");
  expect(classifyNpmViewAttempt({ output: '"1.0.0"', version: "1.0.0" })).toEqual({
    type: "result",
    exists: true,
  });
  expect(readNpmViewResponse).toHaveBeenCalledWith('"1.0.0"');
  expect(classifyNpmViewAvailability).toHaveBeenCalledWith("1.0.0", "1.0.0");
});

test("returns command failures without parsing a response", () => {
  const error = { code: "EAI_AGAIN" };
  classifyNpmViewFailure.mockReturnValue({ type: "failure", error });
  expect(classifyNpmViewAttempt({ error })).toEqual({ type: "failure", error });
  expect(readNpmViewResponse).not.toHaveBeenCalled();
});
