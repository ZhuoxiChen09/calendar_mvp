const { spawnSync } = require("node:child_process");
const { readdirSync } = require("node:fs");
const path = require("node:path");

const files = readdirSync("dist", { recursive: true })
  .filter((file) => file.endsWith(".test.js"))
  .map((file) => path.join("dist", file));
if (!files.length) {
  throw new Error("No compiled tests found in dist/");
}
const result = spawnSync(process.execPath, ["--test", ...files], { stdio: "inherit" });
if (result.error) {
  throw result.error;
}
process.exitCode = result.status ?? 1;
