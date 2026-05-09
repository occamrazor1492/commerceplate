import { parse } from "jsonc-parser";
import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, extname, join } from "path";

const rootDir = process.cwd();

const readText = (relativePath: string) =>
  readFileSync(join(rootDir, relativePath), "utf8");

const readJson = <T>(relativePath: string): T =>
  JSON.parse(readText(relativePath)) as T;

const readJsonc = <T>(relativePath: string): T =>
  parse(readText(relativePath)) as T;

const collectSourceFiles = (directory: string): string[] => {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      return collectSourceFiles(absolutePath);
    }

    return [".ts", ".tsx", ".js", ".jsx"].includes(extname(entry.name))
      ? [absolutePath]
      : [];
  });
};

type PackageJson = {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};

type WranglerConfig = {
  name: string;
  main: string;
  compatibility_date: string;
  compatibility_flags: string[];
  find_additional_modules: boolean;
  base_dir: string;
  rules: Array<{
    type: string;
    globs: string[];
    fallthrough?: boolean;
  }>;
  assets: {
    directory: string;
    binding: string;
  };
  services: Array<{
    binding: string;
    service: string;
  }>;
  images: {
    binding: string;
  };
};

describe("Cloudflare Workers deployment contract", () => {
  it("defines OpenNext and Wrangler package scripts", () => {
    const packageJson = readJson<PackageJson>("package.json");

    expect(packageJson.scripts.build).toBe(
      "node scripts/themeGenerator.mjs && next build",
    );
    expect(packageJson.scripts["build:cf"]).toBe("opennextjs-cloudflare build");
    expect(packageJson.scripts["preview:cf"]).toBe(
      "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    );
    expect(packageJson.scripts["deploy:cf"]).toBe(
      "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    );
    expect(packageJson.scripts["upload:cf"]).toBe(
      "opennextjs-cloudflare build && opennextjs-cloudflare upload",
    );
    expect(packageJson.scripts["cf-typegen"]).toBe(
      "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts",
    );
    expect(packageJson.devDependencies["@opennextjs/cloudflare"]).toBeTruthy();
    expect(packageJson.devDependencies.wrangler).toBeTruthy();
  });

  it("keeps the Next config ESM and initializes OpenNext Cloudflare dev support", () => {
    const nextConfig = readText("next.config.mjs");

    expect(nextConfig).toContain("initOpenNextCloudflareForDev");
    expect(nextConfig).toContain("export default nextConfig");
    expect(nextConfig).toContain("outputFileTracingIncludes");
    expect(nextConfig).toContain("./src/content/**/*");
    expect(nextConfig).toContain("./src/config/**/*");
    expect(nextConfig).not.toContain("module.exports");
    expect(nextConfig).not.toContain("eslint: { ignoreDuringBuilds: true }");
  });

  it("defines the expected Cloudflare Worker runtime contract", () => {
    const wrangler = readJsonc<WranglerConfig>("wrangler.jsonc");

    expect(wrangler.name).toBe("commerceplate");
    expect(wrangler.main).toBe(".open-next/worker.js");
    expect(wrangler.compatibility_date).toBe("2026-05-08");
    expect(wrangler.compatibility_flags).toEqual(
      expect.arrayContaining(["nodejs_compat", "global_fetch_strictly_public"]),
    );
    expect(wrangler.find_additional_modules).toBe(true);
    expect(wrangler.base_dir).toBe(".open-next/server-functions/default");
    expect(wrangler.rules).toContainEqual({
      type: "Text",
      globs: ["src/content/**/*.md", "src/config/**/*.json"],
      fallthrough: true,
    });
    expect(wrangler.assets).toEqual({
      directory: ".open-next/assets",
      binding: "ASSETS",
    });
    expect(wrangler.services).toContainEqual({
      binding: "WORKER_SELF_REFERENCE",
      service: "commerceplate",
    });
    expect(wrangler.images).toEqual({ binding: "IMAGES" });
  });

  it("tracks local-only Cloudflare artifacts outside git", () => {
    const gitignore = readText(".gitignore");

    expect(gitignore).toContain("/.open-next/");
    expect(gitignore).toContain("/.wrangler/");
    expect(gitignore).toContain(".dev.vars");
  });

  it("documents Worker dev vars and immutable static asset caching", () => {
    expect(readText(".dev.vars.example")).toContain("NEXTJS_ENV=development");
    expect(readText("public/_headers")).toContain("/_next/static/*");
    expect(readText("public/_headers")).toContain(
      "Cache-Control: public,max-age=31536000,immutable",
    );
  });

  it("preserves upstream storefront defaults outside the Cloudflare adapter", () => {
    const config = readJson<{
      site: { base_url: string; title: string };
      shopify: {
        currencyCode: string;
        currencySymbol: string;
        collections: Record<string, string>;
      };
    }>("src/config/config.json");

    expect(config.site.title).toBe("Commerceplate");
    expect(config.site.base_url).toBe("https://tf-commerceplate.netlify.app/");
    expect(config.shopify.currencyCode).toBe("BDT");
    expect(config.shopify.currencySymbol).toBe("৳");
    expect(config.shopify.collections.hero_slider).toBe(
      "hidden-homepage-carousel",
    );
    expect(config.shopify.collections.featured_products).toBe(
      "featured-products",
    );
    expect(readText("next-sitemap.config.js")).toContain(
      "https://example.com",
    );
  });

  it("does not opt App Router code into the unsupported Edge runtime", () => {
    const appFiles = collectSourceFiles(join(rootDir, "src/app"));
    const edgeRuntimeMatches = appFiles.filter((file) =>
      /export\s+const\s+runtime\s*=\s*["']edge["']/.test(readFileSync(file, "utf8")),
    );

    expect(edgeRuntimeMatches.map((file) => file.slice(dirname(rootDir).length))).toEqual([]);
  });
});
