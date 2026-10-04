import { jest } from "@jest/globals";
import {
  findMissingRepositoryFiles,
  missingFileMessage,
} from "../../../src/repository/metadata/required-files.mjs";

test("finds missing required repository files", () => {
  expect(
    findMissingRepositoryFiles(
      { existsSync: jest.fn((file) => file === "package.json") },
      { eliware: { apply: [] } },
    ),
  ).toEqual([
    "README.md",
    "AGENTS.md",
    "RELEASE_NOTES.md",
    "docs/",
    "specs/",
    "specs/directives.yaml",
    ".github/workflows/ci.yaml",
  ]);
  expect(missingFileMessage("README.md")).toContain("README.md");
});

test("allows only explicitly documented inapplicable paths", () => {
  const fs = {
    existsSync: (file) => file === ".tagit-exceptions.json" || file === "package.json",
    readFileSync: () => JSON.stringify({ inapplicable: { "examples/": "No examples apply." } }),
  };
  expect(findMissingRepositoryFiles(fs, { eliware: { apply: [] } })).not.toContain("examples/");
  expect(
    findMissingRepositoryFiles(
      { existsSync: (file) => file === "package.json" },
      { eliware: { apply: ["library"] } },
    ),
  ).toContain("examples/");
});

test("uses package metadata from disk and honors exact path exceptions", () => {
  const fs = {
    existsSync: (file) => file === "package.json" || file === ".tagit-exceptions.json",
    readFileSync: (file) =>
      file === "package.json"
        ? JSON.stringify({ eliware: { apply: [] } })
        : JSON.stringify({ inapplicable: { "README.md": "provided externally" } }),
  };
  expect(findMissingRepositoryFiles(fs)).not.toContain("README.md");
});

test("requires directory paths to resolve to directories", () => {
  const fs = {
    existsSync: (file) => ["package.json", "docs/", "specs/"].includes(file),
    lstatSync: (file) => ({ isDirectory: () => file !== "docs/" }),
  };
  expect(findMissingRepositoryFiles(fs, { eliware: { apply: [] } })).toEqual([
    "README.md",
    "AGENTS.md",
    "RELEASE_NOTES.md",
    "docs/",
    "specs/directives.yaml",
    ".github/workflows/ci.yaml",
  ]);
});

test("requires a separate publication workflow for either publication profile", () => {
  const fs = { existsSync: () => false };
  for (const profile of ["npm-published", "ghcr-published"]) {
    expect(findMissingRepositoryFiles(fs, { eliware: { apply: [profile] } })).toContain(
      ".github/workflows/publish.yaml",
    );
  }
});
