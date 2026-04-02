import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

function resolveProjectPath(...segments) {
  return path.join(projectRoot, ...segments);
}

export const deployConfig = {
  server: {
    host: "110.42.111.221",
    port: 22,
    username: "root",
    password: process.env.DEPLOY_SSH_PASSWORD || "",
    privateKey: process.env.DEPLOY_SSH_PRIVATE_KEY || "",
  },
  remoteBaseDir: "/www/wwwroot/.resource-hub-deploy",
  targets: {
    "pc-web": {
      name: "pc-web",
      label: "PC Web",
      cwd: resolveProjectPath("src", "pc-web"),
      buildCommands: ["pnpm build"],
      localDist: resolveProjectPath("src", "pc-web", "dist"),
      remoteDir: "/www/wwwroot/resource-hub/pc-web",
      remoteCommands: [],
    },
    backend: {
      name: "backend",
      label: "Backend",
      cwd: resolveProjectPath("src", "api"),
      buildCommands: ["pnpm build"],
      localDist: resolveProjectPath("src", "api", "dist"),
      artifactDir: resolveProjectPath(".deploy-artifacts", "backend"),
      bundlePaths: [
        "dist",
        "prisma",
        "package.json",
        "pnpm-lock.yaml",
        "ecosystem.config.cjs",
      ],
      remoteDir: "/www/wwwroot/resource-hub/backend",
      preserveEntries: [".env", "logs"],
      remoteCommands: [
        "cd /www/wwwroot/resource-hub/backend && pnpm install --frozen-lockfile --ignore-scripts",
        "cd /www/wwwroot/resource-hub/backend && pnpm exec prisma generate",
        "cd /www/wwwroot/resource-hub/backend && mkdir -p dist/src/generated/prisma",
        "cd /www/wwwroot/resource-hub/backend && cp -f src/generated/prisma/libquery_engine-debian-openssl-3.0.x.so.node dist/src/generated/prisma/",
        "cd /www/wwwroot/resource-hub/backend && pnpm exec prisma migrate deploy",
        "cd /www/wwwroot/resource-hub/backend && npx --yes pm2 delete resource-hub-api || true",
        "cd /www/wwwroot/resource-hub/backend && npx --yes pm2 start ecosystem.config.cjs --update-env",
      ],
    },
  },
};
