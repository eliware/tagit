import { classifyNpmViewResult } from "../../../../../src/registries/npm/error/view/result-policy.mjs";

test("classifies a response that contains the requested version", () => {
  expect(classifyNpmViewResult('"1.0.0"', "1.0.0")).toBe("available");
  expect(classifyNpmViewResult('["1.0.0"]', "1.0.0")).toBe("available");
});

test("classifies a response without the requested version", () => {
  expect(classifyNpmViewResult('"0.9.0"', "1.0.0")).toBe("not-found");
  expect(classifyNpmViewResult('["1.0.0", "1.0.1"]', "1.0.0")).toBe("not-found");
});
