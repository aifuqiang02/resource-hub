import path from "node:path";
import {
  copyPath,
  ensureDirectoryExists,
  ensureFileOrDirectoryExists,
  logStep,
  resetDirectory,
  runCommand,
} from "./shared.mjs";

function prepareArtifactDirectory(target) {
  if (!target.artifactDir || !target.bundlePaths?.length) {
    return target.localDist;
  }

  resetDirectory(target.artifactDir);

  for (const relativePath of target.bundlePaths) {
    const sourcePath = path.join(target.cwd, relativePath);
    const targetPath = path.join(target.artifactDir, relativePath);

    ensureFileOrDirectoryExists(sourcePath, `${target.name} 打包源`);
    copyPath(sourcePath, targetPath);
  }

  return target.artifactDir;
}

export async function buildTarget(target) {
  ensureDirectoryExists(target.cwd);

  for (const command of target.buildCommands) {
    logStep(`${target.name}: 执行本地构建命令 -> ${command}`);
    await runCommand(command, { cwd: target.cwd });
  }

  ensureFileOrDirectoryExists(target.localDist, `${target.name} 构建产物目录`);

  const uploadPath = prepareArtifactDirectory(target);
  ensureFileOrDirectoryExists(uploadPath, `${target.name} 上传目录`);

  return uploadPath;
}
