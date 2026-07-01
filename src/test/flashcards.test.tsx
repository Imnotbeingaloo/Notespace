import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FlashcardDeck, parseFlashcards } from "@/components/FlashcardDeck";
import { getFlashcardSourceText, MIN_FLASHCARD_BODY_CHARS } from "@/lib/note-body";

const sampleDeck = `**Q:** What does spaced repetition help with?
**A:** It helps you revisit material before you forget it, strengthening long-term recall.

---

**Q:** Why should notes include examples?
**A:** Examples make abstract ideas easier to apply later.`;

describe("flashcard source filtering", () => {
  it("removes note titles and headings before AI generation", () => {
    const body = getFlashcardSourceText(
      `# Biology
## Photosynthesis
Photosynthesis turns light energy into chemical energy stored in glucose, while oxygen is released as a byproduct.

Core detail: chlorophyll absorbs light, water is split, and carbon dioxide is fixed during the Calvin cycle.`,
      "Biology",
    );

    expect(body).not.toContain("Biology");
    expect(body).not.toContain("Photosynthesis\n");
    expect(body.length).toBeGreaterThanOrEqual(MIN_FLASHCARD_BODY_CHARS);
    expect(body).toContain("chlorophyll absorbs light");
  });
});

describe("FlashcardDeck", () => {
  it("shows grading buttons only after reveal and labels them correct/wrong", async () => {
    expect(parseFlashcards(sampleDeck)).toHaveLength(2);

    render(<FlashcardDeck markdown={sampleDeck} />);

    expect(screen.queryByRole("button", { name: /correct/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /wrong/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /show answer/i }));

    expect(await screen.findByRole("button", { name: /correct/i })).toBeVisible();
    expect(screen.getByRole("button", { name: /wrong/i })).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: /correct/i }));
    await waitFor(() => expect(screen.getByText(/Card 2 of 2/i)).toBeInTheDocument());
  });
});
