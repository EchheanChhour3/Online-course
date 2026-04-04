import { describe, expect, it } from "vitest";
import {
  getIconComponent,
  getColorClass,
  mapCourseToCard,
} from "@/lib/category-utils";
import { Code2 } from "lucide-react";

describe("category-utils (frontend helpers)", () => {
  it("positive: mapCourseToCard maps snake_case API fields", () => {
    const card = mapCourseToCard({
      course_name: "Algebra",
      instructor_name: "Dr. Smith",
      thumbnail: "https://cdn.example/t.jpg",
    });
    expect(card.title).toBe("Algebra");
    expect(card.instructor).toBe("Dr. Smith");
    expect(card.imageSrc).toBe("https://cdn.example/t.jpg");
  });

  it("positive: mapCourseToCard handles many alternate keys", () => {
    expect(
      mapCourseToCard({ title: "T", instructor: "I" }).title
    ).toBe("T");
    expect(
      mapCourseToCard({ name: "N", instructorName: "J" }).instructor
    ).toBe("J");
  });

  it("negative: mapCourseToCard empty object uses fallbacks", () => {
    const card = mapCourseToCard({});
    expect(card.title).toBe("Untitled Course");
    expect(card.instructor).toBe("Unknown");
  });

  it("positive: getIconComponent known key", () => {
    expect(getIconComponent("BookOpen")).toBeDefined();
  });

  it("negative: getIconComponent unknown falls back to Code2", () => {
    expect(getIconComponent("UnknownIcon")).toBe(Code2);
  });

  it("positive: getColorClass known color", () => {
    expect(getColorClass("blue")).toContain("blue");
  });

  it("negative: getColorClass unknown falls back gray", () => {
    expect(getColorClass("neon")).toContain("gray");
  });
});
