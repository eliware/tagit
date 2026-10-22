import { parseGhcrVersionsResponse } from "../../../../src/registries/ghcr/parse/versions-response.mjs";

test("selects the image with the requested version tag", () => {
  const image = { name: "image", metadata: { container: { tags: ["v2.0.0"] } } };
  expect(parseGhcrVersionsResponse(JSON.stringify([image]), "2.0.0")).toEqual(image);
});

test("flattens paginated responses and returns null when the tag is absent", () => {
  expect(
    parseGhcrVersionsResponse(
      JSON.stringify([[{ metadata: { container: { tags: ["v1.0.0"] } } }], []]),
      "2.0.0",
    ),
  ).toBeNull();
});

test("rejects a response that is not a JSON array", () => {
  expect(() => parseGhcrVersionsResponse("{}", "2.0.0")).toThrow("invalid versions response");
});

test("propagates malformed JSON errors", () => {
  expect(() => parseGhcrVersionsResponse("{bad", "2.0.0")).toThrow(SyntaxError);
});
