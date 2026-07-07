const env = require("../../config/env");

class LocalStorageProvider {
  getPublicUrl(file) {
    return `${env.appBaseUrl}/uploads/${file.filename}`;
  }
}

module.exports = LocalStorageProvider;
