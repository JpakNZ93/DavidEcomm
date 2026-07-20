import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PriceDisplay } from "@/components/product/price-display";

describe("PriceDisplay", () => {
  it("formats cents as AUD dollars", () => {
    render(<PriceDisplay cents={245000} />);

    expect(screen.getByText("$2,450.00")).toBeInTheDocument();
  });
});
