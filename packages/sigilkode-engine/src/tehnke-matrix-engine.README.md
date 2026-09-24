# TEHNKÉ Matrix Engine

Executable boundary for SK-011.2.

- `bridgeSigilV01ToTehnke(input)` translates legacy-shaped intent data into `TEHNKE-IR/V0.2`.
- `executeMatrixEngine(ir)` accepts only V0.2 IR and materializes ordered Matrix applications.
- `compileAndExecuteTehnke(input)` provides the native V0.2 compile + execute path.

The bridge is additive: it does not modify SIGIL-IR/V0.1 source code or legacy input objects.

`APPLIED` means the deterministic Matrix descriptor was consumed by the software engine. `READY` means a manifestation channel was materialized in the execution result. These are engine states, not external-world outcome claims.
