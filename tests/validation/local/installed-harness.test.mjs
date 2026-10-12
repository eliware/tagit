import { hasInstalledSharedHarness } from "../../../src/validation/local/installed-harness.mjs";

function fileSystem(installedPackage, { linked = false, readable = true, exists = true } = {}) {
  return {
    existsSync: () => exists,
    lstatSync: () => ({ isSymbolicLink: () => linked }),
    readFileSync: () => {
      if (!readable) throw new SyntaxError("bad package data");
      return JSON.stringify(installedPackage);
    },
  };
}

const target = (range) => ({ name: "demo", devDependencies: { "@eliware/test": range } });

test("accepts an installed package that matches its declared caret range", () => {
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "4.2.0" }),
      target("^4.0.0"),
    ),
  ).toBe(true);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "4.0.0" }),
      target("^4.0.0"),
    ),
  ).toBe(true);
});

test("accepts exact, tilde, and zero-major caret ranges", () => {
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "4.0.1" }),
      target("4.0.1"),
    ),
  ).toBe(true);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "4.1.5" }),
      target("~4.1.0"),
    ),
  ).toBe(true);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "0.2.4" }),
      target("^0.2.3"),
    ),
  ).toBe(true);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "0.0.3" }),
      target("^0.0.3"),
    ),
  ).toBe(true);
});

test("rejects missing, linked, unreadable, or unrelated installed packages", () => {
  const installed = { name: "@eliware/test", version: "4.2.0" };
  expect(
    hasInstalledSharedHarness(fileSystem(installed, { exists: false }), target("^4.0.0")),
  ).toBe(false);
  expect(hasInstalledSharedHarness(fileSystem(installed, { linked: true }), target("^4.0.0"))).toBe(
    false,
  );
  expect(
    hasInstalledSharedHarness(fileSystem(installed, { readable: false }), target("^4.0.0")),
  ).toBe(false);
  expect(
    hasInstalledSharedHarness(fileSystem({ name: "other", version: "4.2.0" }), target("^4.0.0")),
  ).toBe(false);
});

test("rejects versions outside the declared range and unsupported range syntax", () => {
  const fs = fileSystem({ name: "@eliware/test", version: "5.0.0" });
  expect(hasInstalledSharedHarness(fs, target("^4.0.0"))).toBe(false);
  expect(hasInstalledSharedHarness(fs, target("latest"))).toBe(false);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "bad" }),
      target("^4.0.0"),
    ),
  ).toBe(false);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "4.0.1" }),
      target("4.0.0"),
    ),
  ).toBe(false);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "0.2.4" }),
      target("^0.0.3"),
    ),
  ).toBe(false);
  expect(
    hasInstalledSharedHarness(
      fileSystem({ name: "@eliware/test", version: "4.0.9" }),
      target("~4.1.0"),
    ),
  ).toBe(false);
});

test("allows the harness package itself and unnamed package data", () => {
  expect(hasInstalledSharedHarness({ existsSync: () => false }, { name: "@eliware/test" })).toBe(
    true,
  );
  expect(hasInstalledSharedHarness({ existsSync: () => false }, {})).toBe(true);
  expect(hasInstalledSharedHarness(fileSystem(null), target("^4.0.0"))).toBe(false);
});

test("requires package data when a filesystem cannot read it", () => {
  expect(
    hasInstalledSharedHarness(
      {
        existsSync: () => true,
        lstatSync: () => ({ isSymbolicLink: () => false }),
        readFileSync: undefined,
      },
      target("^4.0.0"),
    ),
  ).toBe(false);
  expect(
    hasInstalledSharedHarness(
      {
        existsSync: () => true,
        lstatSync: () => ({ isSymbolicLink: () => false }),
        readFileSync: () => JSON.stringify({ name: "@eliware/test" }),
      },
      target("^4.0.0"),
    ),
  ).toBe(false);
  expect(
    hasInstalledSharedHarness(
      {
        existsSync: () => true,
        readFileSync: () => JSON.stringify({ name: "@eliware/test", version: "4.0.0" }),
      },
      target("^4.0.0"),
    ),
  ).toBe(false);
});
