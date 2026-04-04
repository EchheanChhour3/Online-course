# Tests — Developer Quick Reference

Formal **test plan, scope, and traceability** live in **[`docs/TESTING.md`](../docs/TESTING.md)**. Read that for QA-style documentation (what is automated vs manual, reporting, Excel matrix).

## Layout

```
tests/
├── api/           # Service-layer tests (mocked fetch) → backend REST contract
├── frontend/      # Zod, utils, small React components (jsdom where needed)
├── helpers/       # mock-fetch helpers
├── mocks/         # bulk-data generators (large lists for pagination/stress)
└── setup.ts       # Vitest + Testing Library setup
```

## Commands

```bash
npm test
npm run test:report    # + docs/vitest-report.json
```

## Related files

| File | Purpose |
|------|---------|
| `../docs/test-cases-matrix.xlsx` | Sheets: **Test cases**, **Mock data**, **Run report** (execution summary + per-TC log) |
| `../docs/vitest-report.json` | Last machine run (after `test:report`) |
| `../vitest.config.ts` | Aliases, `NEXT_PUBLIC_API_URL` for tests |
