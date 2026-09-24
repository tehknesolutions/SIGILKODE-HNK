export interface MatrixApplicationLike {
  identity: string;
  [key: string]: unknown;
}

export type MatrixAdapter = (
  application: MatrixApplicationLike,
  context: Record<string, unknown>
) => unknown;

export const MATRIX_ADAPTER_REGISTRY_VERSION: "SIGILKODE-MATRIX-ADAPTERS/V0.1";
export function registerMatrixAdapter(identity: string, adapter: MatrixAdapter): void;
export function hasMatrixAdapter(identity: string): boolean;
export function applyMatrixAdapter(
  application: MatrixApplicationLike,
  context?: Record<string, unknown>
): Readonly<MatrixApplicationLike & { adapter: string; output: unknown }>;
export function clearMatrixAdapters(): void;
