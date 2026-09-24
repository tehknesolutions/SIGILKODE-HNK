# SK-011.2 validation

Run the focused executable gate with:

`node scripts/validate-sk0112.mjs`

The repository-wide gate remains `pnpm check`, followed by `pnpm build:web`.

Do not merge SK-011.2 solely from the focused runner; the repository-wide regression gate remains authoritative.
