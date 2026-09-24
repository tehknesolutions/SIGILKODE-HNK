export const MATRIX_ADAPTER_REGISTRY_VERSION = "SIGILKODE-MATRIX-ADAPTERS/V0.1";

const adapters = new Map();

export function registerMatrixAdapter(identity, adapter) {
  const key = String(identity ?? "").trim().toUpperCase();
  if (!key) throw new RangeError("matrix adapter identity is required");
  if (typeof adapter !== "function") throw new TypeError("matrix adapter must be a function");
  adapters.set(key, adapter);
}

export function hasMatrixAdapter(identity) {
  return adapters.has(String(identity ?? "").trim().toUpperCase());
}

export function applyMatrixAdapter(application, context = {}) {
  const key = String(application?.identity ?? "").trim().toUpperCase();
  const adapter = adapters.get(key);
  if (!adapter) return Object.freeze({ ...application, adapter: "IDENTITY", output: null });
  return Object.freeze({ ...application, adapter: key, output: adapter(application, context) });
}

export function clearMatrixAdapters() {
  adapters.clear();
}
