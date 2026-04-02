import { deployConfig } from "./deploy.config.mjs";
import { execRemoteCommand, withSSHClient } from "./ssh.mjs";
import { parseArgs } from "./shared.mjs";

function resolveServerConfig(args) {
  return {
    host: args.host ?? deployConfig.server.host,
    port: Number(args.port ?? deployConfig.server.port),
    username: args.username ?? deployConfig.server.username,
    password: args.password ?? deployConfig.server.password,
    privateKey: args["private-key"] ?? deployConfig.server.privateKey,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const server = resolveServerConfig(args);
  const command = String(args.command ?? "").trim();

  if (!command) {
    throw new Error("请通过 --command 传入要执行的远端命令");
  }

  if (!server.password && !server.privateKey) {
    throw new Error("缺少服务器认证信息，请提供 password 或 privateKey");
  }

  await withSSHClient(server, async (ssh) => {
    const result = await execRemoteCommand(ssh, command);
    if (result.code !== 0) {
      throw new Error(`remote command exited with code ${result.code}`);
    }
  });
}

try {
  await main();
} catch (error) {
  console.error(`\n[remote-exec] 失败: ${error.message}`);
  process.exit(1);
}
