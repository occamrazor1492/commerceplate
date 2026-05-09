import dateFormat from "@/lib/utils/dateFormat";
import readingTime from "@/lib/utils/readingTime";
import similerItems from "@/lib/utils/similarItems";
import { sortByDate, sortByWeight } from "@/lib/utils/sortFunctions";
import taxonomyFilter from "@/lib/utils/taxonomyFilter";
import {
  humanize,
  markdownify,
  plainify,
  slugify,
  titleify,
} from "@/lib/utils/textConverter";

const post = (slug: string, frontmatter: Record<string, any>) => ({
  slug,
  content: "",
  frontmatter,
});

describe("content utility helpers", () => {
  it("formats dates with the default and custom patterns", () => {
    expect(dateFormat("2026-05-09")).toBe("09 May, 2026");
    expect(dateFormat("2026-05-09", "yyyy/MM/dd")).toBe("2026/05/09");
  });

  it("estimates reading time for short and image-heavy content", () => {
    expect(readingTime("short content")).toBe("01 Min read");
    expect(readingTime(`${"word ".repeat(1200)} <img src=\"a.jpg\" />`)).toBe(
      "05 Mins read",
    );
  });

  it("sorts posts by date and weight", () => {
    expect(
      sortByDate([
        post("old", { date: "2020-01-01" }),
        post("new", { date: "2022-01-01" }),
      ] as any[]).map((item) => item.slug),
    ).toEqual(["new", "old"]);

    expect(
      sortByWeight([
        post("unweighted", {}),
        post("second", { weight: 2 }),
        post("first", { weight: 1 }),
      ] as any[]).map((item) => item.slug),
    ).toEqual(["first", "second", "unweighted"]);
  });

  it("finds similar items by shared categories or tags while excluding the current slug", () => {
    const current = post("current", {
      categories: ["Lingerie"],
      tags: ["Sale"],
    });
    const items = [
      current,
      post("category-match", { categories: ["Lingerie"], tags: [] }),
      post("tag-match", { categories: [], tags: ["Sale"] }),
      post("miss", { categories: ["Other"], tags: ["Other"] }),
    ];

    expect(similerItems(current as any, items as any[], "current").map((item) => item.slug)).toEqual([
      "category-match",
      "tag-match",
    ]);
  });

  it("filters posts by slugified taxonomy values", () => {
    const posts = [
      post("hit", { categories: ["New Arrivals"] }),
      post("miss", { categories: ["Sale"] }),
    ];

    expect(taxonomyFilter(posts as any[], "categories", "new-arrivals")).toEqual([
      posts[0],
    ]);
  });

  it("converts text, markdown, and HTML to display-safe values", () => {
    expect(slugify("New Arrivals!")).toBe("new-arrivals");
    expect(humanize(" new_arrivals ")).toBe("New arrivals");
    expect(titleify("new arrivals")).toBe("New Arrivals");
    expect(markdownify("**Bold**").__html).toBe("<strong>Bold</strong>");
    expect(markdownify("## Heading", true).__html).toContain("<h2>");
    expect(plainify("Hello &amp; <strong>world</strong>").trim()).toBe(
      "Hello & world",
    );
  });
});
