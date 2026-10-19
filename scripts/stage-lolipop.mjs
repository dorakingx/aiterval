// Build an allowlisted npm workspace from the pnpm monorepo. Never copy .env,
// Git data, local credentials, development fixtures, or submission records.
import { cp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.resolve(process.argv[2] ?? path.join(root, "dist/lolipop"));
if (target === root || root.startsWith(`${target}/`))
  throw new Error("Choose a separate staging directory");
await mkdir(target, { recursive: true });
if ((await readdir(target)).length)
  throw new Error("Staging directory must be empty");
const filter = (file) => !/\.(test|spec)\.[cm]?[jt]sx?$/.test(file);
for (const item of [
  "app",
  "components",
  "lib",
  "public",
  "next.config.ts",
  "next-env.d.ts",
]) {
  await cp(path.join(root, "apps/web", item), path.join(target, item), {
    recursive: true,
    filter,
  });
}
const rootPackage = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
const webPackage = JSON.parse(
  await readFile(path.join(root, "apps/web/package.json"), "utf8"),
);
const rewrite = (deps = {}) =>
  Object.fromEntries(
    Object.entries(deps).map(([name, version]) => [
      name,
      version === "workspace:*" ? "*" : version,
    ]),
  );
const stagedPackage = {
  name: "aiterval-contest",
  version: webPackage.version,
  private: true,
  workspaces: ["vendor/*"],
  scripts: {
    build:
      "AITERVAL_CONTEST=1 AITERVAL_STANDALONE=1 AITERVAL_PUBLIC_ORIGIN=https://aiterval.lolipop-now.app next build",
    start: "node .next/standalone/server.js",
  },
  dependencies: rewrite(webPackage.dependencies),
  devDependencies: webPackage.devDependencies,
  overrides: rootPackage.pnpm.overrides,
};
await writeFile(
  path.join(target, "package.json"),
  JSON.stringify(stagedPackage, null, 2) + "\n",
);
for (const name of ["core", "content", "ui"]) {
  const dest = path.join(target, "vendor", name);
  await mkdir(dest, { recursive: true });
  await cp(path.join(root, "packages", name, "src"), path.join(dest, "src"), {
    recursive: true,
    filter,
  });
  const pkg = JSON.parse(
    await readFile(path.join(root, "packages", name, "package.json"), "utf8"),
  );
  delete pkg.scripts;
  delete pkg.devDependencies;
  pkg.dependencies = rewrite(pkg.dependencies);
  await writeFile(
    path.join(dest, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
  );
}
const config = JSON.parse(
  await readFile(path.join(root, "packages/config/tsconfig.base.json"), "utf8"),
);
config.compilerOptions = {
  ...config.compilerOptions,
  noEmit: true,
  incremental: true,
  plugins: [{ name: "next" }],
};
config.include = [
  "next-env.d.ts",
  ".next/types/**/*.ts",
  "**/*.ts",
  "**/*.tsx",
];
config.exclude = ["node_modules"];
await writeFile(
  path.join(target, "tsconfig.json"),
  JSON.stringify(config, null, 2) + "\n",
);
await cp(path.join(root, "LICENSE"), path.join(target, "LICENSE"));
console.log(`Staged Next.js app with three local npm workspaces: ${target}`);
