import resolvePersonalGhcrVersionsPath from "../../../../src/registries/ghcr/verify/endpoint-fallback.mjs";

test("selects the encoded personal account endpoint after a 404", () => {
  const error = Object.assign(new Error("HTTP 404"), { stderr: "" });
  expect(resolvePersonalGhcrVersionsPath("eli ware", "tag/it", error)).toBe(
    ["", "users", "eli%20ware", "packages", "container", "tag%2Fit", "versions"].join("/"),
  );
});

test("preserves organization errors that are not 404 responses", () => {
  const error = Object.assign(new Error("HTTP 403"), { stderr: "HTTP 403" });
  expect(() => resolvePersonalGhcrVersionsPath("eliware", "tagit", error)).toThrow(error);
});
