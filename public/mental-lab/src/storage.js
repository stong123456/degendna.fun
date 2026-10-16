// Defer access to the browser Storage getter so denied storage is caught by callers.
// Some private/sandboxed contexts throw before getItem itself can run.
export const localStore = {
  getItem(key) {
    return window.localStorage.getItem(key);
  },
  setItem(key, value) {
    window.localStorage.setItem(key, value);
  },
  removeItem(key) {
    window.localStorage.removeItem(key);
  },
};
