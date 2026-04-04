/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Logo, LogoIcon } from "@/components/logo";

describe("Logo components", () => {
  it("positive: Logo renders svg", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("positive: LogoIcon renders with uniColor", () => {
    render(<LogoIcon uniColor className="test-logo" />);
    const svg = document.querySelector("svg.test-logo");
    expect(svg).toBeTruthy();
  });
});
