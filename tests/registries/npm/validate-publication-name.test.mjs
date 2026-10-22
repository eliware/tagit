import { validateNpmPublicationName } from "../../../src/registries/npm/validate-publication-name.mjs";

test.each(["demo", "@eliware/demo", "demo_1", "demo.name"])(
  "accepts the npm publication name %s",
  (name) => expect(validateNpmPublicationName(name, false)).toBe(name),
);

test("allows a missing package name for a private package", () => {
  expect(validateNpmPublicationName(null, true)).toBeNull();
});

test("requires a name for a public package", () => {
  expect(() => validateNpmPublicationName(null, false)).toThrow("must declare a name");
});

test.each(["not valid", "@/bad"])("rejects the invalid npm publication name %s", (name) =>
  expect(() => validateNpmPublicationName(name, false)).toThrow("invalid for publication"),
);
