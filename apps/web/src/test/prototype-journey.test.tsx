import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Index } from "@/routes/index";

describe("static prototype reveal journey", () => {
  it("keeps the fuller result locked until separate delivery consent and confirmation", () => {
    render(<Index />);

    fireEvent.click(screen.getByRole("button", { name: "Teaser" }));
    expect(screen.getByLabelText("Locked fuller result preview")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Send my free assessment/i }));

    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Email me this assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Send my assessment/i }));

    expect(screen.getByTestId("masked-email")).toHaveTextContent("m•••@example.co.nz");
    fireEvent.click(screen.getByRole("button", { name: /Confirm and reveal result/i }));
    expect(screen.getByRole("heading", { name: /Keep current-web evidence/i })).toBeInTheDocument();
    expect(screen.getByText(/not a verified current result/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Future full assessment/i })).toBeDisabled();
  });

  it("lets a reviewer return to the editable email step", () => {
    render(<Index />);
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    fireEvent.click(screen.getByRole("button", { name: /Change email/i }));
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });
});
