import { describe, it, expect } from "vitest";
import { looksLikeGibberish } from "@/lib/gibberish";

describe("looksLikeGibberish", () => {
  it("rejects empty / near-empty text", () => {
    expect(looksLikeGibberish("")).toBe(true);
    expect(looksLikeGibberish("hi")).toBe(true);
  });

  it("rejects long identical-token runs", () => {
    expect(looksLikeGibberish("the the the the the the the")).toBe(true);
  });

  it("rejects repeated bigram loops", () => {
    expect(looksLikeGibberish("maka dora maka dora maka dora maka dora")).toBe(true);
  });

  it("rejects low-vocabulary-diversity text", () => {
    expect(looksLikeGibberish("foo foo foo foo bar foo foo foo foo bar")).toBe(true);
  });

  it("rejects implausible non-words (no vowels, char runs)", () => {
    expect(looksLikeGibberish("xkcd zzzz qqqq mnbv qwrt bcdf lkjh")).toBe(true);
    expect(looksLikeGibberish("aaaa bbbb cccc dddd eeee ffff")).toBe(true);
  });

  it("accepts real explanatory prose", () => {
    const real =
      "Photosynthesis is the process plants use to convert sunlight into chemical energy. " +
      "Chlorophyll in the leaves absorbs light, which drives the conversion of carbon dioxide " +
      "and water into glucose and oxygen. The glucose is stored for later use as an energy source.";
    expect(looksLikeGibberish(real)).toBe(false);
  });

  it("accepts short but valid definitions", () => {
    expect(
      looksLikeGibberish("Mitosis is cell division that produces two identical daughter cells."),
    ).toBe(false);
  });
});
