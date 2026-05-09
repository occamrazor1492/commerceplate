const mockRevalidateTag = vi.hoisted(() => vi.fn());
const mockShopify = vi.hoisted(() => ({
  addToCart: vi.fn(),
  createCart: vi.fn(),
  getCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateCart: vi.fn(),
}));
const mockCookieState = vi.hoisted(() => ({
  values: new Map<string, string>(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: mockRevalidateTag,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (key: string) => {
      const value = mockCookieState.values.get(key);
      return value ? { value } : undefined;
    },
    set: (key: string, value: string) => {
      mockCookieState.values.set(key, value);
    },
  })),
}));

vi.mock("@/lib/shopify", () => mockShopify);

describe("cart server actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieState.values.clear();
    mockShopify.createCart.mockResolvedValue({ id: "new-cart" });
    mockShopify.getCart.mockResolvedValue({ id: "existing-cart" });
    mockShopify.addToCart.mockResolvedValue({});
    mockShopify.removeFromCart.mockResolvedValue({});
    mockShopify.updateCart.mockResolvedValue({});
  });

  it("creates a cart when needed and adds the selected variant", async () => {
    const { addItem } = await import("@/lib/utils/cartActions");

    await expect(addItem(null, "variant-1")).resolves.toBeUndefined();

    expect(mockCookieState.values.get("cartId")).toBe("new-cart");
    expect(mockShopify.addToCart).toHaveBeenCalledWith("new-cart", [
      { merchandiseId: "variant-1", quantity: 1 },
    ]);
    expect(mockRevalidateTag).toHaveBeenCalledWith("cart", "max");
  });

  it("replaces stale cart cookies and reports missing variants", async () => {
    mockCookieState.values.set("cartId", "stale-cart");
    mockShopify.getCart.mockResolvedValue(undefined);
    const { addItem } = await import("@/lib/utils/cartActions");

    await expect(addItem(null, undefined)).resolves.toBe(
      "Missing product variant ID",
    );
    expect(mockCookieState.values.get("cartId")).toBe("new-cart");
    expect(mockShopify.addToCart).not.toHaveBeenCalled();
  });

  it("returns add-to-cart errors without throwing", async () => {
    mockCookieState.values.set("cartId", "cart-1");
    mockShopify.addToCart.mockRejectedValue(new Error("nope"));
    const { addItem } = await import("@/lib/utils/cartActions");

    await expect(addItem(null, "variant-1")).resolves.toMatch(
      /^Error adding item to cart:/,
    );
  });

  it("removes cart lines when a cart cookie exists", async () => {
    mockCookieState.values.set("cartId", "cart-1");
    const { removeItem } = await import("@/lib/utils/cartActions");

    await expect(removeItem(null, "line-1")).resolves.toBeUndefined();
    expect(mockShopify.removeFromCart).toHaveBeenCalledWith("cart-1", [
      "line-1",
    ]);
    expect(mockRevalidateTag).toHaveBeenCalledWith("cart", "max");
  });

  it("reports missing carts and remove failures", async () => {
    const { removeItem } = await import("@/lib/utils/cartActions");

    await expect(removeItem(null, "line-1")).resolves.toBe("Missing cart ID");

    mockCookieState.values.set("cartId", "cart-1");
    mockShopify.removeFromCart.mockRejectedValue(new Error("nope"));
    await expect(removeItem(null, "line-1")).resolves.toMatch(
      /^Error removing item from cart:/,
    );
  });

  it("updates or removes line quantities", async () => {
    mockCookieState.values.set("cartId", "cart-1");
    const { updateItemQuantity } = await import("@/lib/utils/cartActions");

    await expect(
      updateItemQuantity(null, {
        lineId: "line-1",
        variantId: "variant-1",
        quantity: 2,
      }),
    ).resolves.toBeUndefined();
    expect(mockShopify.updateCart).toHaveBeenCalledWith("cart-1", [
      { id: "line-1", merchandiseId: "variant-1", quantity: 2 },
    ]);

    await expect(
      updateItemQuantity(null, {
        lineId: "line-1",
        variantId: "variant-1",
        quantity: 0,
      }),
    ).resolves.toBeUndefined();
    expect(mockShopify.removeFromCart).toHaveBeenCalledWith("cart-1", [
      "line-1",
    ]);
  });

  it("reports missing carts and update failures", async () => {
    const { updateItemQuantity } = await import("@/lib/utils/cartActions");

    await expect(
      updateItemQuantity(null, {
        lineId: "line-1",
        variantId: "variant-1",
        quantity: 1,
      }),
    ).resolves.toBe("Missing cart ID");

    mockCookieState.values.set("cartId", "cart-1");
    mockShopify.updateCart.mockRejectedValue(new Error("nope"));
    await expect(
      updateItemQuantity(null, {
        lineId: "line-1",
        variantId: "variant-1",
        quantity: 1,
      }),
    ).resolves.toMatch(/^Error updating item quantity:/);
  });
});
