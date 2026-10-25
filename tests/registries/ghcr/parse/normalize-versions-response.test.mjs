import { normalizeGhcrVersionsResponse } from "../../../../src/registries/ghcr/parse/normalize-versions-response.mjs";

test("parses an array response and flattens paginated responses", () => {
  const image = { name: "image" };
  expect(normalizeGhcrVersionsResponse(JSON.stringify([[image], []]))).toEqual([image]);
  expect(normalizeGhcrVersionsResponse(JSON.stringify([image]))).toEqual([image]);
});

test("rejects a response that is not a JSON array", () => {
  expect(() => normalizeGhcrVersionsResponse("{}")).toThrow("invalid versions response");
});

test("propagates malformed JSON errors", () => {
  expect(() => normalizeGhcrVersionsResponse("{bad")).toThrow(SyntaxError);
});
