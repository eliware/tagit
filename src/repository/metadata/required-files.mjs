import { readRepositoryExceptions } from "./read-exceptions.mjs";

const requiredRepositoryFiles = [
  "package.json",
  "README.md",
  "AGENTS.md",
  "RELEASE_NOTES.md",
  "docs/",
  "specs/",
  "specs/directives.yaml",
  ".github/workflows/ci.yaml",
];

export function findMissingRepositoryFiles(fs, packageData = null) {
  const exceptions = readRepositoryExceptions(fs);
  const metadata = packageData ?? JSON.parse(fs.readFileSync("package.json", "utf8"));
  const profiles = metadata.eliware?.apply ?? [];
  const required = [...requiredRepositoryFiles];
  if (profiles.includes("library")) required.push("examples/");
  if (profiles.includes("npm-published") || profiles.includes("ghcr-published"))
    required.push(".github/workflows/publish.yaml");
  const exists = (file) => {
    if (!fs.existsSync(file)) return false;
    if (!file.endsWith("/") || typeof fs.lstatSync !== "function") return true;
    return fs.lstatSync(file).isDirectory();
  };
  return required.filter((file) => !exceptions[file] && !exists(file));
}

export function missingFileMessage(file) {
  return `BLOCKED: required repository path is missing: ${file}. Action: restore it or add a documented entry for this exact path to .tagit-exceptions.json, then rerun tagit preflight.`;
}
