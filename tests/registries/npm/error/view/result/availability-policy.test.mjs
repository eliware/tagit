import { classifyNpmViewAvailability } from "../../../../../../src/registries/npm/error/view/result/availability-policy.mjs";

test("classifies a response that contains the requested version", () => {
  expect(classifyNpmViewAvailability("1.0.0", "1.0.0")).toBe("available");
  expect(classifyNpmViewAvailability(["1.0.0"], "1.0.0")).toBe("available");
});

test("classifies a response without the requested version", () => {
  expect(classifyNpmViewAvailability("0.9.0", "1.0.0")).toBe("not-found");
  expect(classifyNpmViewAvailability(["1.0.0", "1.0.1"], "1.0.0")).toBe("not-found");
});
