import { createUrl, ensureStartsWith, validateEnvironmentVariables } from "@/lib/utils";

describe("base utils", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("creates URLs with and without query strings", () => {
    expect(createUrl("/products", new URLSearchParams())).toBe("/products");
    expect(createUrl("/products", new URLSearchParams("q=socks&sort=latest"))).toBe(
      "/products?q=socks&sort=latest",
    );
  });

  it("ensures a prefix exactly once", () => {
    expect(ensureStartsWith("store.myshopify.com", "https://")).toBe(
      "https://store.myshopify.com",
    );
    expect(ensureStartsWith("https://store.myshopify.com", "https://")).toBe(
      "https://store.myshopify.com",
    );
  });

  it("validates required Shopify environment variables", () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "demo.myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "token");

    expect(() => validateEnvironmentVariables()).not.toThrow();
  });

  it("reports missing Shopify environment variables", () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "");

    expect(() => validateEnvironmentVariables()).toThrow(
      /SHOPIFY_STORE_DOMAIN[\s\S]*SHOPIFY_STOREFRONT_ACCESS_TOKEN/,
    );
  });

  it("rejects placeholder Shopify domains with brackets", () => {
    vi.stubEnv("SHOPIFY_STORE_DOMAIN", "[demo].myshopify.com");
    vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", "token");

    expect(() => validateEnvironmentVariables()).toThrow(/includes brackets/);
  });
});
