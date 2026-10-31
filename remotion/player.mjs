// Usage: node player.mjs job.json
// job.json: {scene, out, durationInFrames}
// Bundles the scene with @remotion/player into a self-contained ESM file for
// interactive in-browser playback (play/pause/scrub). Prints one JSON line:
// {ok: true, out} or {ok: false, error}.
import { build } from "esbuild";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const job = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));

const fail = (e) => {
  const msg = String(e?.stack ?? e?.message ?? e).split("\n").slice(0, 25).join("\n");
  console.log(JSON.stringify({ ok: false, error: msg }));
  process.exitCode = 1;
};

try {
  const frames = Math.max(1, job.durationInFrames | 0);
  const sceneSrc = fs.readFileSync(job.scene, "utf8");
  // Resolve the "@kit" alias the same way render.mjs does, by rewriting to a
  // relative import (esbuild has no alias plugin installed).
  const kitAbs = path.join(here, "src/kit/index.ts").replace(/\\/g, "/");
  const rewritten = sceneSrc.split('"@kit"').join(`"${kitAbs}"`).split("'@kit'").join(`'${kitAbs}'`);
  const dir = path.join(here, ".player", path.basename(job.scene, path.extname(job.scene)));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Scene.tsx"), rewritten);
  fs.writeFileSync(
    path.join(dir, "entry.tsx"),
    `import React from "react";\n` +
      `import { createRoot } from "react-dom/client";\n` +
      `import { Player } from "@remotion/player";\n` +
      `import Scene from "./Scene";\n` +
      `createRoot(document.getElementById("root")!).render(\n` +
      `  <Player component={Scene} durationInFrames={${frames}} compositionWidth={1080} compositionHeight={1920} fps={30} controls autoPlay loop acknowledgeRemotionLicense style={{ width: "100%", height: "100%" }} />\n` +
      `);\n`,
  );
  await build({
    entryPoints: [path.join(dir, "entry.tsx")],
    bundle: true,
    format: "esm",
    outfile: job.out,
    loader: { ".tsx": "tsx", ".ts": "ts" },
    jsx: "automatic",
    minify: true,
    logLevel: "silent",
  });
  console.log(JSON.stringify({ ok: true, out: job.out }));
} catch (e) {
  fail(e);
}
