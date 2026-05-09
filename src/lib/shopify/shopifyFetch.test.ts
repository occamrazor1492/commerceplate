const responseBody = { data: { ok: true } };
const mockRevalidateTag = vi.hoisted(() => vi.fn());
const mockHeadersState = vi.hoisted(() => ({
  current: new Headers(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: mockRevalidateTag,
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => mockHeadersState.current),
}));

vi.mock("next/server", () => ({
  NextRequest: class NextRequest {},
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), init),
  },
}));

const importShopifyFetch = async ({
  privateToken,
  legacyToken,
}: {
  privateToken?: string;
  legacyToken?: string;
}) => {
  vi.resetModules();
  vi.stubEnv("SHOPIFY_STORE_DOMAIN", "demo-store.myshopify.com");
  vi.stubEnv("SHOPIFY_STOREFRONT_PRIVATE_ACCESS_TOKEN", privateToken || "");
  vi.stubEnv("SHOPIFY_STOREFRONT_ACCESS_TOKEN", legacyToken || "");

  return import("@/lib/shopify");
};

const money = (amount = "10.00", currencyCode = "USD") => ({
  amount,
  currencyCode,
});

const image = (url = "https://cdn.shopify.com/product.jpg", altText = "") => ({
  url,
  altText,
  width: 100,
  height: 100,
});

const product = (overrides: Record<string, any> = {}) => ({
  id: "gid://shopify/Product/1",
  handle: "sample-product",
  availableForSale: true,
  title: "Sample Product",
  description: "Plain text description",
  descriptionHtml: "<p>Plain text description</p>",
  options: [],
  priceRange: {
    maxVariantPrice: money(),
    minVariantPrice: money(),
  },
  compareAtPriceRange: {
    maxVariantPrice: money("0.00"),
  },
  variants: {
    edges: [
      {
        node: {
          id: "gid://shopify/ProductVariant/1",
          title: "Default Title",
          availableForSale: true,
          selectedOptions: [],
          price: money(),
        },
      },
    ],
  },
  featuredImage: image("https://cdn.shopify.com/featured.jpg", "Featured"),
  images: {
    edges: [
      {
        node: image("https://cdn.shopify.com/sample.jpg"),
      },
    ],
  },
  seo: {
    title: "Sample Product",
    description: "SEO description",
  },
  tags: [],
  updatedAt: "2026-01-01T00:00:00Z",
  vendor: "Vendor A",
  collections: {
    nodes: [{ title: "Collection A" }],
  },
  ...overrides,
});

const cart = (overrides: Record<string, any> = {}) => ({
  id: "gid://shopify/Cart/1",
  checkoutUrl: "https://checkout.example",
  cost: {
    subtotalAmount: money(),
    totalAmount: money(),
    ...overrides.cost,
  },
  lines: {
    edges: [
      {
        node: {
          id: "line-1",
          quantity: 1,
          cost: {
            totalAmount: money(),
          },
          merchandise: {
            id: "variant-1",
            title: "Default Title",
            selectedOptions: [],
            product: product(),
          },
        },
      },
    ],
  },
  totalQuantity: 1,
  ...overrides,
});

const connection = (nodes: any[], pageInfo = {}) => ({
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    endCursor: "cursor",
    ...pageInfo,
  },
  edges: nodes.map((node) => ({ node })),
});

describe("shopifyFetch", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    mockHeadersState.current = new Headers();
    mockRevalidateTag.mockReset();
  });

  it("uses the private Storefront token when both token styles are present", async () => {
    const fetchMock = vi.fn(async () => Response.json(responseBody));
    vi.stubGlobal("fetch", fetchMock);

    const { shopifyFetch } = await importShopifyFetch({
      privateToken: "private-token",
      legacyToken: "legacy-token",
    });

    const result = await shopifyFetch({
      query: "query Test { shop { name } }",
      variables: { cursor: "next" },
      tags: ["products"],
    });

    expect(result).toEqual({ status: 200, body: responseBody });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://demo-store.myshopify.com/api/2023-01/graphql.json",
      expect.objectContaining({
        method: "POST",
        cache: "no-store",
        next: { tags: ["products"] },
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "Shopify-Storefront-Private-Token": "private-token",
        }),
        body: JSON.stringify({
          query: "query Test { shop { name } }",
          variables: { cursor: "next" },
        }),
      }),
    );
    expect(fetchMock.mock.calls[0]?.[1]?.headers).not.toHaveProperty(
      "X-Shopify-Storefront-Access-Token",
    );
  });

  it("falls back to the legacy Storefront access token", async () => {
    const fetchMock = vi.fn(async () => Response.json(responseBody));
    vi.stubGlobal("fetch", fetchMock);

    const { shopifyFetch } = await importShopifyFetch({
      legacyToken: "legacy-token",
    });

    await shopifyFetch({ query: "query Test { shop { name } }" });

    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": "legacy-token",
    });
  });

  it("merges caller headers and wraps Shopify GraphQL payload errors", async () => {
    const fetchMock = vi.fn(async () =>
      Response.json({
        errors: [
          {
            message: "Bad query",
            status: 422,
            cause: new Error("Invalid field"),
          },
        ],
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { shopifyFetch } = await importShopifyFetch({
      legacyToken: "legacy-token",
    });

    await expect(
      shopifyFetch({
        query: "query Broken { nope }",
        headers: {
          "X-Extra": "1",
        },
      }),
    ).rejects.toMatchObject({
      error: {
        status: 422,
        message: "Bad query",
      },
      query: "query Broken { nope }",
    });
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "X-Extra": "1",
    });
  });

  it("wraps non-Shopify fetch failures with the attempted query", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );

    const { shopifyFetch } = await importShopifyFetch({
      legacyToken: "legacy-token",
    });

    await expect(shopifyFetch({ query: "query Test { shop { name } }" })).rejects.toMatchObject({
      query: "query Test { shop { name } }",
    });
  });
});

describe("Shopify data helpers", () => {
  const importShopify = () =>
    importShopifyFetch({
      legacyToken: "legacy-token",
    });

  const mockResponses = (responses: Array<Record<string, any>>) => {
    const queue = [...responses];
    const fetchMock = vi.fn(async () => Response.json(queue.shift()));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    mockHeadersState.current = new Headers();
    mockRevalidateTag.mockReset();
  });

  it("reshapes cart mutations and cart lookups", async () => {
    const fetchMock = mockResponses([
      { data: { cartCreate: { cart: cart() } } },
      { data: { cartLinesAdd: { cart: cart({ totalQuantity: 2 }) } } },
      { data: { cartLinesRemove: { cart: cart({ totalQuantity: 0 }) } } },
      { data: { cartLinesUpdate: { cart: cart({ totalQuantity: 3 }) } } },
      { data: { cart: null } },
      { data: { cart: cart() } },
    ]);
    const { createCart, addToCart, removeFromCart, updateCart, getCart } =
      await importShopify();

    expect(await createCart()).toMatchObject({
      id: "gid://shopify/Cart/1",
      totalQuantity: 1,
      cost: { totalTaxAmount: money("0.0") },
      lines: [{ id: "line-1" }],
    });
    expect(
      await addToCart("cart-1", [{ merchandiseId: "variant-1", quantity: 2 }]),
    ).toMatchObject({ totalQuantity: 2 });
    expect(await removeFromCart("cart-1", ["line-1"])).toMatchObject({
      totalQuantity: 0,
    });
    expect(
      await updateCart("cart-1", [
        { id: "line-1", merchandiseId: "variant-1", quantity: 3 },
      ]),
    ).toMatchObject({ totalQuantity: 3 });
    expect(await getCart("expired")).toBeUndefined();
    expect(await getCart("cart-1")).toMatchObject({ lines: [{ id: "line-1" }] });

    expect(JSON.parse(fetchMock.mock.calls[1]?.[1]?.body as string).variables).toEqual({
      cartId: "cart-1",
      lines: [{ merchandiseId: "variant-1", quantity: 2 }],
    });
  });

  it("reshapes collections and collection products", async () => {
    const visibleCollection = {
      handle: "visible",
      title: "Visible",
      description: "",
      seo: { title: "Visible", description: "" },
      updatedAt: "2026-01-01T00:00:00Z",
      products: connection([]),
    };
    const hiddenCollection = { ...visibleCollection, handle: "hidden-sale" };
    const fetchMock = mockResponses([
      { data: { collection: visibleCollection } },
      { data: { collection: null } },
      { data: { collection: { products: connection([product()]) } } },
      {
        data: {
          collections: {
            edges: [
              { node: visibleCollection },
              { node: hiddenCollection },
              { node: null },
            ],
          },
        },
      },
    ]);
    const { getCollection, getCollectionProducts, getCollections } =
      await importShopify();

    expect(await getCollection("visible")).toMatchObject({
      handle: "visible",
      path: "/products/visible",
    });
    await expect(
      getCollectionProducts({
        collection: "missing",
        sortKey: "CREATED_AT",
        reverse: true,
      }),
    ).resolves.toEqual({ pageInfo: null, products: [] });
    expect(
      await getCollectionProducts({
        collection: "visible",
        sortKey: "CREATED_AT",
      }),
    ).toMatchObject({
      pageInfo: { endCursor: "cursor" },
      products: [{ handle: "sample-product", images: [{ altText: "Sample Product - sample" }] }],
    });
    expect(await getCollections()).toEqual([
      expect.objectContaining({ handle: "visible" }),
    ]);

    expect(JSON.parse(fetchMock.mock.calls[2]?.[1]?.body as string).variables).toMatchObject({
      handle: "visible",
      sortKey: "CREATED",
    });
  });

  it("handles customer, menu, page, product, vendor, and price helpers", async () => {
    const visibleProduct = product();
    const hiddenProduct = product({
      handle: "hidden-product",
      tags: ["nextjs-frontend-hidden"],
    });
    mockResponses([
      {
        data: {
          customerCreate: {
            customer: { id: "customer-1", email: "a@example.com" },
            customerUserErrors: [],
          },
        },
      },
      {
        data: {
          customerAccessTokenCreate: {
            customerAccessToken: { accessToken: "customer-token" },
            customerUserErrors: [],
          },
        },
      },
      { data: { customer: { email: "a@example.com" } } },
      {
        data: {
          menu: {
            items: [
              {
                title: "Collection",
                url: "https://demo-store.myshopify.com/collections/sale",
              },
              {
                title: "About",
                url: "https://demo-store.myshopify.com/pages/about",
              },
            ],
          },
        },
      },
      { data: { pageByHandle: { handle: "about", title: "About" } } },
      { data: { pages: connection([{ handle: "about" }, { handle: "faq" }]) } },
      { data: { product: hiddenProduct } },
      { data: { productRecommendations: [visibleProduct, hiddenProduct] } },
      {
        data: {
          products: connection([
            product({ vendor: "Vendor A" }),
            product({ vendor: "Vendor A" }),
            product({ vendor: "Vendor B" }),
            product({ vendor: "" }),
          ]),
        },
      },
      { data: { products: connection([visibleProduct, hiddenProduct]) } },
      { data: { products: connection([visibleProduct, hiddenProduct]) } },
      {
        data: {
          products: {
            edges: [
              {
                node: {
                  variants: {
                    edges: [{ node: { price: money("99.00", "EUR") } }],
                  },
                },
              },
            ],
          },
        },
      },
    ]);
    const {
      createCustomer,
      getCustomerAccessToken,
      getUserDetails,
      getMenu,
      getPage,
      getPages,
      getProduct,
      getProductRecommendations,
      getVendors,
      getTags,
      getProducts,
      getHighestProductPrice,
    } = await importShopify();

    await expect(
      createCustomer({
        email: "a@example.com",
        password: "password",
        firstName: "A",
        lastName: "B",
      }),
    ).resolves.toMatchObject({ customer: { id: "customer-1" } });
    await expect(
      getCustomerAccessToken({ email: "a@example.com", password: "password" }),
    ).resolves.toEqual({ token: "customer-token", customerLoginErrors: [] });
    await expect(getUserDetails("customer-token")).resolves.toMatchObject({
      customer: { email: "a@example.com" },
    });
    await expect(getMenu("main-menu")).resolves.toEqual([
      { title: "Collection", path: "/search/sale" },
      { title: "About", path: "/about" },
    ]);
    await expect(getPage("about")).resolves.toMatchObject({ title: "About" });
    await expect(getPages()).resolves.toEqual([
      { handle: "about" },
      { handle: "faq" },
    ]);
    await expect(getProduct("hidden-product")).resolves.toMatchObject({
      handle: "hidden-product",
    });
    await expect(getProductRecommendations("product-1")).resolves.toEqual([
      expect.objectContaining({ handle: "sample-product" }),
    ]);
    await expect(getVendors({})).resolves.toEqual([
      { vendor: "Vendor A", productCount: 2 },
      { vendor: "Vendor B", productCount: 1 },
    ]);
    await expect(getTags({})).resolves.toEqual([
      expect.objectContaining({ handle: "sample-product" }),
    ]);
    await expect(getProducts({ cursor: "next" })).resolves.toMatchObject({
      pageInfo: { endCursor: "cursor" },
      products: [{ handle: "sample-product" }],
    });
    await expect(getHighestProductPrice()).resolves.toEqual(money("99.00", "EUR"));
  });

  it("revalidates only authorized Shopify product and collection webhooks", async () => {
    vi.stubEnv("SHOPIFY_REVALIDATION_SECRET", "secret");
    const { revalidate } = await importShopify();

    mockHeadersState.current = new Headers([["x-shopify-topic", "products/update"]]);
    const okResponse = await revalidate({
      nextUrl: new URL("https://site.test/api/revalidate?secret=secret"),
    } as any);
    await expect(okResponse.json()).resolves.toMatchObject({
      status: 200,
      revalidated: true,
    });
    expect(mockRevalidateTag).toHaveBeenCalledWith("products", "max");

    mockRevalidateTag.mockClear();
    mockHeadersState.current = new Headers([["x-shopify-topic", "collections/update"]]);
    await revalidate({
      nextUrl: new URL("https://site.test/api/revalidate?secret=secret"),
    } as any);
    expect(mockRevalidateTag).toHaveBeenCalledWith("collections", "max");

    mockRevalidateTag.mockClear();
    mockHeadersState.current = new Headers([["x-shopify-topic", "orders/create"]]);
    const ignoredResponse = await revalidate({
      nextUrl: new URL("https://site.test/api/revalidate?secret=secret"),
    } as any);
    await expect(ignoredResponse.json()).resolves.toEqual({ status: 200 });
    expect(mockRevalidateTag).not.toHaveBeenCalled();

    const invalidResponse = await revalidate({
      nextUrl: new URL("https://site.test/api/revalidate?secret=wrong"),
    } as any);
    await expect(invalidResponse.json()).resolves.toEqual({ status: 200 });
  });
});
