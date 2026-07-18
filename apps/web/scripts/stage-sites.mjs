import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const output = path.join(project, "dist");
const server = path.join(output, "server");

await rm(output, { recursive: true, force: true });
await mkdir(server, { recursive: true });
await copyFile(
  path.join(project, "worker", "index.js"),
  path.join(server, "index.js"),
);
await cp(path.join(project, "out"), path.join(output, "client"), {
  recursive: true,
});
