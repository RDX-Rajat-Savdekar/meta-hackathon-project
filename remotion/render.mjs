// Usage: node render.mjs job.json
// job.json: {scene, out, durationInFrames, props?, gl?, concurrency?}
// Prints one JSON line: {ok: true, out} or {ok: false, error}.
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const job = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
const dir = path.join(here, ".jobs", randomUUID());

const entry = `import React from "react";
import { Composition, registerRoot } from "remotion";
import Scene from "./Scene";
const Root = () => (
  <Composition id="Seg" component={Scene} durationInFrames={${Math.max(1, job.durationInFrames | 0)}}
    fps={30} width={1080} height={1920} defaultProps={${JSON.stringify(job.props ?? {})}} />
);
registerRoot(Root);
`;

const fail = (e) => {
  const msg = String(e?.stack ?? e?.message ?? e).split("\n").slice(0, 25).join("\n");
  console.log(JSON.stringify({ ok: false, error: msg }));
  process.exitCode = 1;
};

try {
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(job.scene, path.join(dir, "Scene.tsx"));
  fs.writeFileSync(path.join(dir, "entry.tsx"), entry);
  const serveUrl = await bundle({
    entryPoint: path.join(dir, "entry.tsx"),
    webpackOverride: (c) => ({
      ...c,
      resolve: { ...c.resolve, alias: { ...(c.resolve?.alias ?? {}), "@kit": path.join(here, "src/kit/index.ts") } },
    }),
  });
  const chromiumOptions = { gl: job.gl ?? "angle" };
  const composition = await selectComposition({ serveUrl, id: "Seg", chromiumOptions, inputProps: job.props ?? {} });
  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: job.out,
    chromiumOptions,
    inputProps: job.props ?? {},
    concurrency: job.concurrency ?? 4,
    timeoutInMilliseconds: 60000,
    muted: true,
  });
  console.log(JSON.stringify({ ok: true, out: job.out }));
} catch (e) {
  fail(e);
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
