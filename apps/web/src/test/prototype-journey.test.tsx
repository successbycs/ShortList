import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Index } from "@/routes/index";

describe("static prototype reveal journey", () => {
  function moveToEmailStep() {
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    fireEvent.click(screen.getByRole("button", { name: /Show completed assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Send my free assessment/i }));
  }

  it("keeps the fuller result locked until separate delivery consent and confirmation", () => {
    render(<Index />);

    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));
    fireEvent.click(screen.getByRole("button", { name: /Show completed assessment/i }));
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
    moveToEmailStep();
    fireEvent.change(screen.getByLabelText("Email address"), {
      target: { value: "mara@example.co.nz" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: /Email me this assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Send my assessment/i }));
    fireEvent.click(screen.getByRole("button", { name: /Change email/i }));
    expect(screen.getByLabelText("Email address")).toBeInTheDocument();
  });

  it("uses the shared admission gate before entering the checking view", () => {
    render(<Index />);

    fireEvent.change(screen.getByLabelText("Your business website"), {
      target: { value: "127.0.0.1" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/public business website/i);
    expect(screen.queryByText("Following the public trail.")).not.toBeInTheDocument();
  });

  it("normalises the submitted domain and keeps it visible during checking", () => {
    render(<Index />);

    fireEvent.change(screen.getByLabelText("Your business website"), {
      target: { value: "HTTPS://Harbour-Handyman.CO.NZ/path" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Check my website/i }));

    expect(screen.getByText("harbour-handyman.co.nz")).toBeInTheDocument();
  });
});
