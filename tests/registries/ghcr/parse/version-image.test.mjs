import { findGhcrVersionImage } from "../../../../src/registries/ghcr/parse/version-image.mjs";

test("selects an image with the requested version tag", () => {
  const image = { metadata: { container: { tags: ["v2.0.0"] } } };
  expect(findGhcrVersionImage([image], "2.0.0")).toBe(image);
});

test("returns null when no image has the requested version tag", () => {
  expect(findGhcrVersionImage([{ metadata: { container: { tags: ["v1.0.0"] } } }], "2.0.0")).toBe(
    null,
  );
});
