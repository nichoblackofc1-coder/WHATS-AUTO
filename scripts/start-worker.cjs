process.env.NODE_ENV = "production";
process.env.GATEWAY_WORKER = "true";
process.env.PORT = "3031";
process.env.HOSTNAME = "127.0.0.1";
require("tsx/cjs");
require("../src/server/worker.ts");
