import { suggestVersion } from './versionSuggestion.mjs';

const OUTPUT_LIMIT = 12000;

function run(execSync, command) {
  return execSync(command, { encoding: 'utf8' }).trim();
}

export function buildNotesReport(execSync, fs) {
  const suggestion = suggestVersion(execSync, fs);
  const tag = suggestion.latestTag;
  const commits = run(execSync, `git log --oneline --decorate ${tag}..HEAD`);
  const files = run(execSync, `git diff --name-status ${tag}..HEAD`);
  const diff = run(execSync, `git diff ${tag}..HEAD -- . ":!package-lock.json" ":!coverage" ":!node_modules"`);
  const excerpt = diff.length > OUTPUT_LIMIT ? `${diff.slice(0, OUTPUT_LIMIT)}\n...[diff truncated at ${OUTPUT_LIMIT} characters]` : diff;
  return `TAGIT NOTES REPORT\nRange: ${tag}..HEAD\nSuggested release: ${suggestion.suggested} (${suggestion.level})\nReason: ${suggestion.reason}\n\nCOMMITS\n${commits || '(none)'}\n\nCHANGED FILES\n${files || '(none)'}\n\nDIFF\n${excerpt || '(no source diff)'}\n\nAI ACTIONS\n1. Read the complete diff and inspect affected code, tests, workflows, and documentation.\n2. Determine the user-visible, breaking, security, compatibility, and operational impact.\n3. Verify the suggested version bump; change it only when the diff justifies another SemVer level.\n4. Update RELEASE_NOTES.md with concise categorized entries and the exact release version.\n5. Add or update regression, integration, smoke, or E2E tests where the change requires them.\n6. Run tagit preflight after the notes and tests are complete.\nThis command is read-only: it does not edit files, change versions, commit, tag, or publish.`;
}
