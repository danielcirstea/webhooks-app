class MemoryStore {
  constructor() {
    this.webhookStorage = [];
  }

  get() {
    return this.webhookStorage;
  }

  set(url, token) {
    this.webhookStorage.push({ url, token });
  }

}

module.exports = MemoryStore;
