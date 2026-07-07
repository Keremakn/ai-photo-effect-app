const app = require("./app");
const env = require("./config/env");

app.listen(env.port, () => {
  console.log(`Backend API is running on ${env.appBaseUrl}`);
});
