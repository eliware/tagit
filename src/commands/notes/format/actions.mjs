export function formatNotesActions() {
  return [
    "AI ACTIONS",
    "1. Read the full diff.",
    "   Inspect affected code, tests, workflows, and docs.",
    "2. Identify changes users can see, breaking changes, compatibility changes, and operation effects.",
    "   Check for possible data exposure.",
    "3. Update RELEASE_NOTES.md with short categories and the exact release version.",
    "",
    "4. Add or update tests when the change requires them.",
    "   Use regression, integration, smoke, or E2E tests.",
    "5. Run tagit preflight after you update the notes and tests.",
    "",
    "The tagit command reads files and makes no changes. It does not change versions, commit, tag, or publish.",
  ];
}
