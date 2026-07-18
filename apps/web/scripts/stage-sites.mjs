import { cp, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const project = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const source = path.join(project, ".open-next");
const output = path.join(project, "dist");
const server = path.join(output, "server");

await rm(output, { recursive: true, force: true });
await mkdir(server, { recursive: true });
await cp(source, server, { recursive: true, dereference: true });
await rename(path.join(server, "worker.js"), path.join(server, "index.js"));
await cp(path.join(source, "assets"), path.join(output, "client"), {
  recursive: true,
  dereference: true,
});
