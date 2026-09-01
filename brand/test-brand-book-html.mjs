import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const htmlPath = join(here, "alex-car-restoration-brand-book.html");
const vercelConfigPath = join(root, "vercel.json");

assert.ok(existsSync(htmlPath), "brand-book HTML file exists");

const html = readFileSync(htmlPath, "utf8");

assert.match(html, /^<!doctype html>/i, "is a standalone HTML document");
assert.match(html, /<meta[^>]+name="viewport"/i, "declares a responsive viewport");
assert.match(html, /<title>Alex Car Restoration — Internal Brand Guide<\/title>/i);
assert.match(html, /<main\b/i, "uses semantic main content");
assert.match(html, /<nav\b[^>]+aria-label=/i, "navigation has an accessible label");
assert.match(html, /id="brand"/i, "contains brand section");
assert.match(html, /id="visual-system"/i, "contains visual system section");
assert.match(html, /id="photography"/i, "contains photography section");
assert.match(html, /id="voice"/i, "contains voice section");
assert.match(html, /id="website"/i, "contains website translation section");
assert.match(html, /id="sources"/i, "contains sources section");
assert.match(html, /300\+ Car Show Awards since 1992/i, "keeps the attributed award claim");
assert.match(html, /88K Facebook followers at research date/i, "keeps the time-sensitive follower context");
assert.match(html, /Full Restoration/i, "includes verified service hierarchy");
assert.match(html, /UNKNOWN/i, "preserves unresolved research items");
assert.match(html, /facebook\.com/i, "contains primary-source links");
assert.match(html, /assets\//i, "uses local sourced photography");
assert.doesNotMatch(html, /<img(?![^>]*\balt=)[^>]*>/gi, "every image has alt text");
assert.match(html, /@media\s*\(max-width:/i, "includes a narrow-screen layout");
assert.match(html, /prefers-reduced-motion/i, "respects reduced-motion preferences");
assert.match(html, /\.mobile-nav\s*\{\s*display:\s*none;\s*\}/i, "mobile navigation is hidden outside its breakpoint");

assert.equal((html.match(/<section\b/g) ?? []).length, 12, "refinement preserves the existing section structure");
assert.match(html, /class="hero-actions"/i, "hero provides a clear action group");
assert.match(html, /href="https:\/\/tinyurl\.com\/alexcarbooking"[^>]*class="button button-primary"/i, "primary hero action uses the public booking route");
assert.match(html, /class="project-showcase"/i, "photography section presents a named project showcase");
assert.equal((html.match(/class="service-card/g) ?? []).length, 5, "five verified services render as service cards");
assert.doesNotMatch(html, /class="[^"]*\breveal\b/i, "content does not depend on generic scroll-reveal classes");

assert.ok(existsSync(vercelConfigPath), "Vercel configuration exists at the repository root");

const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, "utf8"));
const brandBookRewrite = vercelConfig.rewrites?.find(({ source }) => source === "/brand-book");
const assetRewrite = vercelConfig.rewrites?.find(({ source }) => source === "/assets/:path*");

assert.equal(vercelConfig.$schema, "https://openapi.vercel.sh/vercel.json", "uses Vercel's current configuration schema");
assert.equal(brandBookRewrite?.destination, "/brand/alex-car-restoration-brand-book.html", "serves the brand book at its public route");
assert.equal(assetRewrite?.destination, "/brand/assets/:path*", "keeps the HTML's existing asset URLs working");

const routedDocument = brandBookRewrite.destination.slice(1);
const routedImage = assetRewrite.destination.replace(":path*", "datsun-240z-workshop-hero.jpg").slice(1);

assert.ok(existsSync(join(root, routedDocument)), "root route resolves to the real HTML document");
assert.ok(existsSync(join(root, routedImage)), "asset route resolves to a real project image");

console.log("Brand-book HTML checks passed.");
