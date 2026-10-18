// 同时启动本地文件服务（8787）与 Vite 前端（5173）。
// 运行：npm run dev:local
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function start(name, cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, shell: process.platform === "win32", stdio: "inherit" });
  child.on("exit", code => {
    console.log(`[dev:local] ${name} 退出 (code ${code})`);
    process.exit(code ?? 0);
  });
  return child;
}

console.log("[dev:local] 启动本地文件服务 + 前端开发服务器...");
start("kb-server", "node", ["server/index.js"], root);
start("vite", "npm", ["run", "dev"], root);
