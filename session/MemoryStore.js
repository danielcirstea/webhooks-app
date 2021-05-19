class MemoryStore {
  constructor() {
    this.webhookStorage = [];
  }

  get() {
    return this.webhookStorage;
  }

  set(data) {
    this.webhookStorage.push(data);
  }

}

module.exports = MemoryStore;
