import { isObject, isShopifyError } from "@/lib/typeGuards";

describe("type guards", () => {
  it("recognizes plain objects only", () => {
    expect(isObject({ ok: true })).toBe(true);
    expect(isObject(null)).toBe(false);
    expect(isObject(["not", "plain"])).toBe(false);
  });

  it("recognizes native and Error-like Shopify errors", () => {
    expect(isShopifyError(new Error("boom"))).toBe(true);
    expect(isShopifyError({ status: 500, message: new Error("boom") })).toBe(
      false,
    );

    const inheritedError = Object.create(new Error("from prototype"));
    expect(isShopifyError(inheritedError)).toBe(true);
    expect(isShopifyError(null)).toBe(false);
  });
});
