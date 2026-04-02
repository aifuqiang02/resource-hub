import fs from "node:fs";
import path from "node:path";

import { deployConfig } from "./deploy.config.mjs";
import { execRemoteCommand, withSSHClient } from "./ssh.mjs";

const remotePath = "/www/server/panel/vhost/nginx/tx07.conf";
const backupPath = "/www/server/panel/vhost/nginx/tx07.conf.resource-hub.bak";
const localTempPath = path.resolve(process.cwd(), ".deploy-artifacts", "tx07.conf.tmp");

const wwwBlock = `    location /resource-hub {
        alias /www/wwwroot/resource-hub/pc-web/;
        try_files $uri $uri/ /resource-hub/index.html;
    }

`;

const apiBlock = `    location ^~ /resource-hub {
        rewrite ^/resource-hub(/.*)$ $1 break;
        proxy_pass http://127.0.0.1:40251;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

`;

function upsertConfig(content) {
  let next = content;

  if (next.includes("location /resource-hub")) {
    next = next.replace(
      /    location \/resource-hub \{[\s\S]*?    \}\n\n/,
      wwwBlock,
    );
  } else {
    next = next.replace(
      "    # biz-cancellation PC端\n",
      `${wwwBlock}    # biz-cancellation PC端\n`,
    );
  }

  if (!next.includes("location ^~ /resource-hub")) {
    next = next.replace(
      "    # biz-cancellation 后端API\n",
      `${apiBlock}    # biz-cancellation 后端API\n`,
    );
  }

  return next;
}

async function main() {
  fs.mkdirSync(path.dirname(localTempPath), { recursive: true });

  await withSSHClient(deployConfig.server, async (ssh) => {
    await ssh.getFile(localTempPath, remotePath);

    if (!fs.existsSync(localTempPath)) {
      throw new Error(`下载 Nginx 配置失败: ${remotePath}`);
    }

    const current = fs.readFileSync(localTempPath, "utf8");
    const next = upsertConfig(current);

    fs.writeFileSync(localTempPath, next);

    const backup = await execRemoteCommand(ssh, `cp ${remotePath} ${backupPath}`);
    if (backup.code !== 0) {
      throw new Error(backup.stderr || "备份 Nginx 配置失败");
    }

    await ssh.putFile(localTempPath, remotePath);

    const testResult = await execRemoteCommand(ssh, "nginx -t");
    if (testResult.code !== 0) {
      throw new Error(testResult.stderr || "nginx -t 失败");
    }

    const reloadResult = await execRemoteCommand(ssh, "nginx -s reload");
    if (reloadResult.code !== 0) {
      throw new Error(reloadResult.stderr || "nginx reload 失败");
    }
  });
}

try {
  await main();
} catch (error) {
  console.error(`\n[sync-nginx] 失败: ${error.message}`);
  process.exit(1);
}
