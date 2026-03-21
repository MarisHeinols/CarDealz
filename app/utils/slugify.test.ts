import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("converts strings to lowercase", () => {
    expect(slugify("HELLO")).toBe("hello");
  });

  it("replaces spaces and special characters with hyphens", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("My Cool Store.com")).toBe("my-cool-store-com");
  });

  it("strips accents and normalizes characters", () => {
    expect(slugify("Māris Heinols")).toBe("maris-heinols");
    expect(slugify("café")).toBe("cafe");
  });

  it("replaces ampersands with 'and'", () => {
    expect(slugify("Smith & Co")).toBe("smith-and-co");
  });

  it("handles empty or null values gracefully", () => {
    expect(slugify("")).toBe("");
    expect(slugify(null as any)).toBe("");
  });
});
