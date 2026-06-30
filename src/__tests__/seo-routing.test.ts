/**
 * Guardrail: verifies that app-only routes are NEVER indexable.
 *
 * 1. Every PRIVATE_ROUTE_PATTERNS entry has a Disallow rule in robots.txt
 *    for every indexing bot.
 * 2. sitemap.xml contains zero URLs matching any private pattern.
 * 3. Every PUBLIC_ROUTES entry is present in sitemap.xml.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
import {
  PUBLIC_ROUTES,
  PRIVATE_ROUTE_PATTERNS,
  INDEXING_BOTS,
} from "../../scripts/site-routes";

const robots = readFileSync(resolve("public/robots.txt"), "utf-8");
const sitemap = readFileSync(resolve("public/sitemap.xml"), "utf-8");

function blockFor(bot: string): string {
  // Grab the lines between `User-agent: <bot>` and the next blank line.
  const re = new RegExp(
    `User-agent:\\s*${bot.replace("*", "\\*")}\\s*\\n([\\s\\S]*?)(?:\\n\\s*\\n|$)`,
    "i",
  );
  const match = robots.match(re);
  return match?.[1] ?? "";
}

describe("robots.txt blocks every private route for every indexing bot", () => {
  for (const bot of INDEXING_BOTS) {
    for (const pattern of PRIVATE_ROUTE_PATTERNS) {
      it(`${bot} disallows ${pattern}`, () => {
        const block = blockFor(bot);
        expect(block, `User-agent: ${bot} block missing in robots.txt`).not.toBe("");
        expect(block).toMatch(new RegExp(`Disallow:\\s*${pattern.replace(/\//g, "\\/")}\\s*$`, "m"));
      });
    }
  }
});

describe("sitemap.xml excludes every private route", () => {
  for (const pattern of PRIVATE_ROUTE_PATTERNS) {
    it(`does not contain any URL matching ${pattern}`, () => {
      // Strip trailing slash for prefix matching; "/app" must also catch "/app/foo".
      const prefix = pattern.endsWith("/") ? pattern : pattern + "(?:$|[/?#\"<])";
      const re = new RegExp(`<loc>https?:\\/\\/[^<]*${prefix}`, "i");
      expect(sitemap, `sitemap.xml leaks private route ${pattern}`).not.toMatch(re);
    });
  }
});

describe("sitemap.xml contains every public route", () => {
  for (const { path } of PUBLIC_ROUTES) {
    it(`contains ${path}`, () => {
      expect(sitemap).toContain(`<loc>https://notespace.lovable.app${path}</loc>`);
    });
  }
});
