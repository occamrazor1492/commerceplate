vi.mock("@/lib/contentParser", () => ({
  getSinglePage: vi.fn(() => [
    { frontmatter: { categories: ["New Arrivals", "Sale"] } },
    { frontmatter: { categories: ["New Arrivals", "Basics"] } },
  ]),
}));

describe("taxonomyParser", () => {
  it("returns unique slugified taxonomies", async () => {
    const { getTaxonomy } = await import("@/lib/taxonomyParser");

    expect(getTaxonomy("blog", "categories")).toEqual([
      "new-arrivals",
      "sale",
      "basics",
    ]);
  });

  it("returns all slugified taxonomies including duplicates", async () => {
    const { getAllTaxonomy } = await import("@/lib/taxonomyParser");

    expect(getAllTaxonomy("blog", "categories")).toEqual([
      "new-arrivals",
      "sale",
      "new-arrivals",
      "basics",
    ]);
  });
});
