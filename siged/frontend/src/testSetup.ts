import "@testing-library/jest-dom";

/**
 * Node 26 ships an experimental global `localStorage` that stays `undefined` unless the
 * process is started with `--localstorage-file`. In the jsdom environment `globalThis` and
 * `window` are the same object, so that undefined global clobbers the jsdom storage and
 * leaves nothing to fall back to. Install an in-memory Storage when it is missing.
 */
function createMemoryStorage(): Storage {
  let entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries = new Map();
    },
    getItem(key: string) {
      return entries.has(String(key)) ? entries.get(String(key))! : null;
    },
    key(index: number) {
      return [...entries.keys()][index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(String(key));
    },
    setItem(key: string, value: string) {
      entries.set(String(key), String(value));
    },
  };
}

for (const name of ["localStorage", "sessionStorage"] as const) {
  if (typeof globalThis[name] === "undefined") {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      value: createMemoryStorage(),
      writable: true,
    });
  }
}
