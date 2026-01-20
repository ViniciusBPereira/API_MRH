const cache = new Map();

export default {
  set(key, value) {
    cache.set(key, value);
  },

  get(key) {
    return cache.get(key);
  },

  has(key) {
    return cache.has(key);
  },
};
