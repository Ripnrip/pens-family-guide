#!/usr/bin/env node
// Assembles static-build/ (vercel.json outputDirectory) so Vercel's CDN serves:
//   /              -> site/index.html          (splash site, built by a separate agent; optional)
//   /assets/*      -> site/assets/*, with public/assets/* (the canonical, swappable brand logo SVG/PNGs)
//                     overriding same-named files so one logo file drives the app and the site
// Everything else (/mcp, /mcp/submission-*, /preview, /privacy, /terms, /support, /reviewer-demo,
// /healthz, and / when site/ is missing) falls through vercel.json rewrites to the Express function.
// Only site/index.html and site/assets/** are copied, so the site can never shadow an app route.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.resolve(root, process.argv[2] ?? "static-build");
const site = process.env.PENS_SITE_DIR ? path.resolve(process.env.PENS_SITE_DIR) : path.join(root, "site");

rmSync(out, { recursive: true, force: true });
mkdirSync(path.join(out, "assets"), { recursive: true });

if (existsSync(path.join(site, "assets"))) cpSync(path.join(site, "assets"), path.join(out, "assets"), { recursive: true });

const publicAssets = path.join(root, "public", "assets");
if (existsSync(publicAssets)) cpSync(publicAssets, path.join(out, "assets"), { recursive: true, force: true });
if (existsSync(path.join(site, "film", "index.html"))) {
  mkdirSync(path.join(out, "film"), { recursive: true });
  cpSync(path.join(site, "film", "index.html"), path.join(out, "film", "index.html"));
  console.log("static-build: /film page included");
}
if (existsSync(path.join(site, "index.html"))) {
  cpSync(path.join(site, "index.html"), path.join(out, "index.html"));
  console.log("static-build: splash site included");
} else {
  console.log("static-build: no site/index.html; / is served by the Express fallback page");
}
