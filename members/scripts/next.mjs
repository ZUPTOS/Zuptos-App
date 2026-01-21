import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const rootDir = path.resolve(appDir, "..");
const nextBin = path.join(rootDir, "node_modules", "next", "dist", "bin", "next");

const args = process.argv.slice(2).filter((arg) => arg !== "--");

const child = spawn(process.execPath, [nextBin, ...args], {
  cwd: appDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
