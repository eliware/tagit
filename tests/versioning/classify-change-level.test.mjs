import { classifyChangeLevel } from "../../src/versioning/classify-change-level.mjs";

test("classifies breaking, substantial, and small changes", () => {
  expect(classifyChangeLevel(["README.md"], "+ BREAKING CHANGE")).toMatchObject({ level: "major" });
  expect(classifyChangeLevel(["src/a.mjs"], "+ implementation")).toMatchObject({ level: "minor" });
  expect(classifyChangeLevel(["README.md"], "docs")).toMatchObject({ level: "patch" });
});

test("gives breaking changes priority over substantial change rules", () => {
  expect(
    classifyChangeLevel(["src/a.mjs", "src/b.mjs"], "+ BREAKING CHANGE\n" + "+x".repeat(250)),
  ).toMatchObject({
    level: "major",
  });
});
