import { validateReleaseWorkflow } from '../../../src/repository/metadata/validate-workflow.mjs';

const valid = `on:\n  push:\n    tags:\n      - 'v*'\npermissions:\n  contents: read\njobs:\n  build:\n    steps:\n      - uses: actions/checkout@v6\n      - run: npm ci\n      - run: npm test\n      - run: npm run lint\n      - run: npm run typecheck\n      - run: npm audit --omit=dev --audit-level=moderate\n      - run: npm run pack\n  publish:\n    needs: build\n    if: startsWith(github.ref, 'refs/tags/v')\n    permissions:\n      id-token: write`;

test('accepts a gated tag-only publication workflow', () => {
  expect(validateReleaseWorkflow({ existsSync: () => true, readFileSync: () => valid })).toEqual([]);
});

test('reports missing validation and publication safeguards', () => {
  const failures = validateReleaseWorkflow({ existsSync: () => true, readFileSync: () => 'jobs:\n  publish:\n    run: npm publish' });
  expect(failures.length).toBeGreaterThan(1);
  expect(failures.join('\n')).toContain('npm test');
});

test('does not confuse a workflow push trigger with publication on branches', () => {
  expect(validateReleaseWorkflow({ existsSync: () => true, readFileSync: () => valid.replace('refs/tags/v', 'refs/heads/main') })).toEqual([
    'BLOCKED: publish job must depend on validation and run only for v* tags.',
  ]);
});
