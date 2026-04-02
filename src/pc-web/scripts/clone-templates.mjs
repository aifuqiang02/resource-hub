import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const sourceDir = path.resolve(__dirname, '..')
const parentDir = path.dirname(sourceDir)

const templates = [
  {
    dirName: 'vite-vue3-vant-template',
    packageName: 'vite-vue3-vant-template',
  },
  {
    dirName: 'vite-vue3-elementplus-tailwindcss-template',
    packageName: 'vite-vue3-elementplus-tailwindcss-template',
  },
]

const excludedPaths = new Set([
  '.git',
  'node_modules',
  'dist',
  'dist-ssr',
  'coverage',
  '.turbo',
  '.idea',
])

const shouldCopy = (entryPath) => {
  const relativePath = path.relative(sourceDir, entryPath)

  if (!relativePath) {
    return true
  }

  const segments = relativePath.split(path.sep)

  return !segments.some((segment) => excludedPaths.has(segment))
}

const updatePackageName = async (targetDir, packageName) => {
  const packageJsonPath = path.join(targetDir, 'package.json')
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))

  packageJson.name = packageName

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8')
}

const ensureTemplateClone = async ({ dirName, packageName }) => {
  const targetDir = path.join(parentDir, dirName)

  await rm(targetDir, { recursive: true, force: true })
  await mkdir(targetDir, { recursive: true })
  await cp(sourceDir, targetDir, {
    recursive: true,
    filter: shouldCopy,
    verbatimSymlinks: true,
  })
  await updatePackageName(targetDir, packageName)

  return targetDir
}

const main = async () => {
  const clonedDirs = []

  for (const template of templates) {
    clonedDirs.push(await ensureTemplateClone(template))
  }

  for (const clonedDir of clonedDirs) {
    console.log(`Created: ${clonedDir}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
