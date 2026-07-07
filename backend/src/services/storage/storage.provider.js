const LocalStorageProvider = require("./local-storage.provider");

function createStorageProvider() {
  return new LocalStorageProvider();
}

module.exports = createStorageProvider;
