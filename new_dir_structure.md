# Ultimate single-responsibility directory structure

This is a design target, not an implementation claim. The goal is to make the
directory tree express the architecture: each production module owns one
reason to change, and each leaf module has a mirrored focused test file.
Coordinators may compose modules, but they should not contain policy, parsing,
filesystem, process, GitHub, registry, or formatting logic.

## Decomposition progress

Update this checklist after each focused change. “Complete” means the target
module and its mirrored tests exist; it does not mean the whole project has
been decomposed.

- [x] Remove the obsolete GitOps version-pin updater from the architecture.
- [x] Move public CLI smoke coverage into the main CLI test area.
- [x] Split CI-link reporting, CI verification, CLI guidance/options, GHCR
      verification, npm verification, push dispatch, registry discovery, release
      command timing, repository validation, and validation-message formatting into
      separate current modules with focused tests.
- [x] Relocate CI-link reporting into `github/links/report-ci-links.mjs` and
      remove the superseded flat implementation and test.
- [x] Decompose release verification into GitHub run selection, job-policy
      validation, publication orchestration, and reporting modules.
- [x] Extract release-run selection, release-job policy, GitHub JSON reading,
      repository-name reading, and release-link formatting from the release
      verification coordinator.
- [x] Decompose preflight into repository, local-test, CI, and report modules.
- [x] Extract required-file, package-metadata, and secret-path validation from
      the repository validation coordinator with mirrored tests.
- [x] Extract local npm test-command construction from the preflight
      coordinator with a mirrored test.
- [x] Extract exact-HEAD CI orchestration from the preflight coordinator with
      a mirrored test.
- [x] Extract preflight failure aggregation and formatting with a mirrored
      test.
- [x] Move validation output redaction and failure messages into focused
      `output/errors` modules with mirrored tests.
- [x] Move GHCR workflow discovery into `registries/ghcr/discover-publication.mjs`
      and remove the superseded flat module and test.
- [x] Move npm publication polling into `registries/npm/verify-publication.mjs`
      and remove the superseded flat module and test.
- [x] Move GHCR publication verification into
      `registries/ghcr/verify-publication.mjs` and remove the superseded flat
      module and test.
- [x] Move CLI help, preflight guidance, and release guidance into focused
      `cli/guidance` modules with mirrored tests.
- [x] Move the public CLI option facade into `cli/arguments/parse-options.mjs`
      and remove the superseded flat option module and test.
- [x] Remove the superseded flat CLI guidance module and test after migrating
      all guidance imports to `cli/guidance`.
- [x] Move the notes report coordinator into `commands/notes/build-report.mjs`
      and remove the superseded flat report module and test.
- [x] Move repository validation into `repository/validate-repository.mjs` and
      update all consumers and tests to the nested architecture.
- [x] Move release dispatch into `commands/release/dispatch.mjs` and remove the
      superseded flat dispatcher implementation.
- [x] Move the preflight coordinator into `validation/preflight/run-checks.mjs`
      and update its consumers and tests.
- [x] Move exact-HEAD CI verification into `validation/ci/verify-exact-head.mjs`
      and update preflight consumers and tests.
- [x] Move release verification orchestration into
      `commands/release-wait/verify-release.mjs` and update all registry/GitHub
      consumers and tests.
- [x] Move the Git release coordinator into `git/release/operate-release.mjs`
      and update its consumers and tests.
- [x] Remove the unused repository-validation compatibility barrel after all
      callers and tests moved to the nested validator.
- [x] Move the public CLI coordinator into `cli/application/run-tagit.mjs`;
      `bin/*-cli.mjs` remains the executable wrapper boundary.
- [x] Decompose the command coordinator and command-specific dispatchers.
- [x] Split CLI command classification, release-version parsing, and option
      validation into focused argument modules with mirrored tests.
- [x] Move command routing, ownership guidance, version output, and command
      dispatch into `cli/application/dispatch-command.mjs`; retain `tagit.mjs`
      only as the public dependency-injection/process boundary.
- [x] Move push orchestration into `commands/push/run-push.mjs` and remove its
      superseded flat dispatcher and test.
- [x] Move the low-level existing-commit push operation into
      `commands/push/push-existing-commits.mjs` and remove the flat push/process
      runner compatibility modules and tests.
- [x] Move notes command orchestration into `commands/notes/run-notes.mjs` with
      a mirrored command-boundary test.
- [x] Move preflight reporting and release-wait execution into focused command
      modules with mirrored tests; retain release dispatch as the remaining
      release-only coordinator.
- [x] Move release mutation/verification orchestration into
      `commands/release/run-release.mjs` with mirrored tests.
- [x] Extract latest release-tag resolution and immutability confirmation from
      the release dispatcher with a mirrored test.
- [x] Decompose Git operations into command execution, branch/state checks, and
      tag lifecycle modules.
- [x] Extract Git command execution and release-tag create/push operations into
      focused modules with mirrored tests.
- [x] Keep the Git coordinator limited to sequencing the extracted HEAD,
      existing-tag, create-tag, push-tag, and remote-verification policies.
- [x] Extract release-tag identity validation and remote-tag verification with
      mirrored tests.
- [x] Extract existing-tag lookup, reuse, and conflict resolution with a
      mirrored test.
- [x] Decompose notes, upstream, versioning, and process utilities.
- [x] Extract notes change collection and report formatting with mirrored tests.
- [x] Move notes version suggestion into `commands/notes/suggest-version.mjs`
      and remove the superseded flat version-suggestion module and test.
- [x] Extract package-version reading, change-level classification, and next
      version calculation with mirrored tests.
- [x] Extract upstream merge-message validation and upstream-branch resolution
      with mirrored tests.
- [x] Move upstream merge execution and CLI detection into focused upstream
      modules; remove the superseded flat coordinator and test.
- [x] Extract sleep, synchronous wait, and platform npm executable selection
      into process modules with mirrored tests.
- [x] Decompose the synchronous runner, asynchronous runner, and Windows
      executable resolver behind a stable process-boundary barrel.
- [x] Move the asynchronous release command runner into the process async
      architecture and remove its superseded flat module and test.
- [x] Relocate every test into the mirrored architecture tree and leave only
      coordinator tests at orchestration boundaries.
- [x] Remove superseded flat modules after all imports and mirrored tests move.
- [x] Run `eliware-test` and resolve every monolith and source/test mapping
      violation.
- [x] After each extraction slice, rerun `npm test`; current source/test tree
      passes the shared harness at 100×4 with zero lint warnings.
- [x] Complete the proposed leaf-module inventory: the current source tree is
      decomposed into focused policy, repository, validation, GitHub, registry,
      process, output, upstream, versioning, and command leaves. A final audit
      confirmed every current `src/**/*.mjs` has a mirrored test, except the
      public `cli/application/run-tagit.mjs` coordinator, which is covered by the
      main CLI orchestration/smoke suite; coordinators contain sequencing only.
- [x] Extract optional-Windows CI and coverage-waiver policies into focused
      `policy` modules with mirrored tests.
- [x] Extract owner command-boundary guidance and explicit release-version
      policy into focused modules with mirrored tests.
- [x] Extract template-repository and immutable release-tag policies into
      focused modules with mirrored tests.
- [x] Extract repository branch and clean-worktree state policies into focused
      `repository/branch` and `repository/state` modules with mirrored tests.
- [x] Extract package.json reading into `repository/metadata/read-package-json.mjs`
      with a mirrored test.
- [x] Split repository validation orchestration into branch, metadata, and
      tracked-file validators with mirrored tests.
- [x] Split exact-HEAD CI validation into run-record validation, exact-head
      selection, job-record validation, and job-policy evaluation modules with
      mirrored tests.
- [x] Split GHCR publication verification into repository parsing and
      visibility polling modules with mirrored tests.
- [x] Move preflight command resolution into the validation/local boundary and
      reuse the shared process executable policy instead of duplicating it.
- [x] Split semantic-version parsing from next-version calculation and reuse
      the parser for package-version validation with mirrored tests.
- [x] Remove the uncovered next-version compatibility wrapper; notes now use
      the named `versioning/suggest-next-version.mjs` leaf directly.
- [x] Split release-wait publication-target discovery and publish-job policy
      from registry verification with mirrored tests.
- [x] Split output secret redaction/truncation and GitHub-link repository-name
      parsing into focused leaves with mirrored tests.
- [x] Extract Windows command-shim process options from preflight execution
      with mirrored tests.
- [x] Split upstream argument parsing, CLI detection, and merge execution from
      the upstream command coordinator with mirrored tests.
- [x] Remove the uncovered upstream CLI compatibility wrapper; callers use the
      focused `upstream-cli.mjs` leaf directly.
- [x] Extract npm package-name discovery into
      `registries/npm/read-package-name.mjs` with a mirrored test.
- [x] Extract GHCR version-tag and image-digest verification into focused
      registry leaves with mirrored tests.
- [x] Extract release CI polling, selection, and exact-commit verification into
      `commands/release-wait/release-ci-status.mjs` with a mirrored test.
- [x] Extract release polling-budget validation into
      `process/timing/poll-budget.mjs` with a mirrored test.

## Proposed tree

```text
src/
  cli/
    application/
      run-tagit.mjs
      detect-cli.mjs
      dependencies.mjs
    arguments/
      classify-command.mjs
      parse-options.mjs
      parse-version-option.mjs
      validate-options.mjs
      option-errors.mjs
    guidance/
      help-text.mjs
      preflight-guide.mjs
      release-guide.mjs
    errors/
      classify-cli-error.mjs
      format-cli-error.mjs

  commands/
    notes/
      run-notes.mjs
      build-notes-report.mjs
      latest-tag.mjs
      changed-commits.mjs
      changed-files.mjs
      source-diff.mjs
      notes-version-suggestion.mjs
    preflight/
      run-preflight.mjs
      preflight-options.mjs
      preflight-failures.mjs
      preflight-report.mjs
    push/
      run-push.mjs
      push-options.mjs
      push-existing-commits.mjs
      push-ci-links.mjs
    release/
      run-release.mjs
      release-options.mjs
      require-release-version.mjs
      verify-release-metadata.mjs
      release-preflight.mjs
      create-release-tag.mjs
      push-release-tag.mjs
      verify-remote-tag.mjs
      release-dry-run.mjs
    release-wait/
      run-release-wait.mjs
      latest-release-tag.mjs
      release-ci-status.mjs
      release-publication-status.mjs
      release-wait-report.mjs

  policy/
    owner-guidance.mjs
    release-version-policy.mjs
    tag-policy.mjs
    template-repository-policy.mjs
    windows-ci-policy.mjs
    coverage-waiver-policy.mjs

  repository/
    branch/read-current-branch.mjs
    branch/require-main.mjs
    state/read-worktree-status.mjs
    state/require-clean-worktree.mjs
    state/read-head-sha.mjs
    metadata/read-package-json.mjs
    metadata/validate-package-metadata.mjs
    metadata/required-files.mjs
    metadata/check-required-files.mjs
    metadata/read-notag-policy.mjs
    secrets/find-secret-looking-paths.mjs
    repository-name/read-repository-name.mjs

  validation/
    local/run-npm-test.mjs
    local/require-test-script.mjs
    local/format-test-failure.mjs
    ci/validate-run-list.mjs
    ci/validate-run-record.mjs
    ci/validate-job-list.mjs
    ci/validate-job-record.mjs
    ci/verify-exact-head.mjs
    ci/verify-ubuntu-job.mjs
    ci/verify-optional-windows-jobs.mjs
    ci/poll-pending-run.mjs
    ci/format-ci-failure.mjs

  git/
    commands/run-git.mjs
    commands/run-git-async.mjs
    commands/resolve-executable.mjs
    tags/read-local-tag.mjs
    tags/read-latest-tag.mjs
    tags/validate-tag-name.mjs
    tags/check-tag-conflict.mjs
    tags/create-tag.mjs
    tags/push-tag.mjs
    tags/verify-remote-tag.mjs

  github/
    cli/run-gh.mjs
    cli/run-gh-async.mjs
    runs/list-runs.mjs
    runs/read-run.mjs
    runs/read-run-jobs.mjs
    runs/select-latest-exact-head-run.mjs
    runs/select-latest-exact-tag-run.mjs
    links/report-ci-links.mjs
    links/format-ci-link.mjs

  registries/
    npm/read-package-name.mjs
    npm/read-dist-tags.mjs
    npm/read-version-metadata.mjs
    npm/poll-publication.mjs
    npm/verify-publication.mjs
    ghcr/discover-publication.mjs
    ghcr/read-package-manifest.mjs
    ghcr/read-image-manifest.mjs
    ghcr/verify-version-tag.mjs
    ghcr/verify-image-digest.mjs
    ghcr/verify-publication.mjs
    publication/verify-all-publication.mjs

  process/
    sync/run-process.mjs
    async/run-process.mjs
    commands/npm-executable.mjs
    timing/sleep.mjs
    timing/wait-sync.mjs
    timing/poll-budget.mjs

  output/
    redaction/redact-secrets.mjs
    redaction/redact-command-output.mjs
    errors/failure-message.mjs
    errors/action-message.mjs
    reports/format-run-summary.mjs

  upstream/
    run-upstream.mjs
    parse-upstream-arguments.mjs
    upstream-cli.mjs

  versioning/
    parse-semver.mjs
    suggest-next-version.mjs
    classify-change-level.mjs
    read-version-from-package.mjs

bin/
  tagit-cli.mjs
  push-cli.mjs
  upstream-cli.mjs

tests/
  cli/application/run-tagit.test.mjs
  cli/arguments/parse-options.test.mjs
  cli/arguments/parse-version-option.test.mjs
  cli/arguments/validate-options.test.mjs
  cli/guidance/help-text.test.mjs
  commands/notes/build-notes-report.test.mjs
  commands/preflight/run-preflight.test.mjs
  commands/push/run-push.test.mjs
  commands/release/run-release.test.mjs
  commands/release-wait/run-release-wait.test.mjs
  policy/*.test.mjs
  repository/**/*.test.mjs
  validation/**/*.test.mjs
  git/**/*.test.mjs
  github/**/*.test.mjs
  registries/**/*.test.mjs
  process/**/*.test.mjs
  output/**/*.test.mjs
  upstream/**/*.test.mjs
  versioning/**/*.test.mjs
```

## Responsibility rules

- A module should have one primary verb in its name: parse, read, validate,
  select, verify, format, poll, create, push, or run.
- A `run-*` module is an orchestration boundary only. It delegates policy and
  side effects to leaf modules and contains no parsing or formatting rules.
- Filesystem, Git, GitHub CLI, npm, GHCR, timers, and process execution remain
  behind injected adapters so leaf modules can be tested without the network
  or a real repository.
- Every leaf production file gets one mirrored test file in the corresponding
  test subtree. Coordinator tests cover ordering and composition only.
- Cross-cutting fixtures belong under `tests/fixtures/`; shared test helpers
  belong under `tests/support/` and are not counted as production modules.
- Public command smoke tests belong under the corresponding command test tree,
  not in an unpaired top-level test file.

## Current-to-target decomposition map

The current large modules split as follows:

- `src/tagit.mjs` → `cli/application`, `cli/arguments`, `commands/*`, and
  `cli/errors`.
- `src/releaseChecks.mjs` → `repository/*`, `validation/local`, and
  `validation/ci`.
- `src/releaseVerification.mjs` → `github/runs`, `registries/*`, and
  `commands/release-wait`.
- `src/gitOperations.mjs` → `git/commands` and `git/tags`.
- `src/releaseCommand.mjs` and `src/processRunner.mjs` → `process/*`.
- `src/releaseNotesReport.mjs` → `commands/notes/*`.
- `src/cliOptions.mjs` and `src/cliGuidance.mjs` → `cli/arguments` and
  `cli/guidance`.
- `src/validationMessages.mjs` → `output/*`.
- `src/versionSuggestion.mjs` → `versioning/*`.

The existing `bin/*` files remain thin process-entry wrappers. No GitOps
version-pin updater is included: GitOps owns deployment manifests and pin
changes, and that behavior is explicitly outside Tagit's scope.
