import {
  getListPage,
  getSinglePage,
  resolveContentPath,
} from "@/lib/contentParser";
import fs from "fs";

vi.mock("next/navigation", () => ({
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

describe("contentParser", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("falls back to the Cloudflare Worker bundle filesystem", () => {
    expect(resolveContentPath("Cloudflare-Workers")).toBe(
      "/bundle/src/content",
    );
  });

  it("reads markdown frontmatter and content from list pages", () => {
    const page = getListPage("sections/call-to-action.md");

    expect(page.frontmatter.title).toBe(
      "Curved Collection for Your Bedroom Get 25% Off",
    );
    expect(page.frontmatter.button).toMatchObject({
      enable: true,
      label: "Shop Now",
      link: "/products",
    });
    expect(page.content).toBe("");
  });

  it("lists only published single markdown pages with stable slugs", () => {
    const pages = getSinglePage("pages");

    expect(pages.map((page) => page.slug).sort()).toEqual([
      "privacy-policy",
      "terms-services",
    ]);
    expect(pages.every((page) => page.frontmatter.draft === false)).toBe(true);
  });

  it("throws Next notFound for missing list pages", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(() => getListPage("missing.md")).toThrow("NEXT_NOT_FOUND");
  });

  it("throws Next notFound for draft list pages", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "readFileSync").mockReturnValue(
      "---\ndraft: true\ntitle: Draft\n---\nHidden copy",
    );

    expect(() => getListPage("draft.md")).toThrow("NEXT_NOT_FOUND");
  });

  it("filters private, draft, and future single pages while honoring custom URLs", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(true);
    vi.spyOn(fs, "lstatSync").mockReturnValue({
      isDirectory: () => true,
    } as fs.Stats);
    vi.spyOn(fs, "readdirSync").mockReturnValue([
      "_index.md",
      "draft.md",
      "future.md",
      "custom.md",
      "not-markdown.txt",
    ] as unknown as fs.Dirent[]);
    vi.spyOn(fs, "readFileSync").mockImplementation((filePath) => {
      const filename = String(filePath).split("/").pop();

      if (filename === "draft.md") {
        return "---\ndraft: true\ndate: 2020-01-01\n---\nDraft";
      }

      if (filename === "future.md") {
        return "---\ndraft: false\ndate: 2999-01-01\n---\nFuture";
      }

      return "---\ndraft: false\ndate: 2020-01-01\nurl: /custom-url\n---\nPublished";
    });

    expect(getSinglePage("pages")).toEqual([
      {
        frontmatter: {
          draft: false,
          date: "2020-01-01T00:00:00.000Z",
          url: "/custom-url",
        },
        slug: "custom-url",
        content: "Published",
      },
    ]);
  });

  it("throws Next notFound when a single-page folder is missing", () => {
    vi.spyOn(fs, "existsSync").mockReturnValue(false);

    expect(() => getSinglePage("missing-folder")).toThrow("NEXT_NOT_FOUND");
  });
});
