import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstitutionForm } from "../InstitutionForm";

describe("InstitutionForm", () => {
  it("marks codigo, nombre and ruc as required with a visible indicator", () => {
    render(<InstitutionForm onCancel={vi.fn()} onSave={vi.fn()} />);

    expect(screen.getByLabelText(/código de institución/i)).toBeRequired();
    expect(screen.getByLabelText(/^nombre/i)).toBeRequired();
    expect(screen.getByLabelText(/^ruc/i)).toBeRequired();
  });

  it("trims leading and trailing whitespace before saving", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(<InstitutionForm onCancel={vi.fn()} onSave={onSave} />);

    fireEvent.change(screen.getByLabelText(/código de institución/i), {
      target: { value: "  INST-01  " },
    });
    fireEvent.change(screen.getByLabelText(/^nombre/i), {
      target: { value: "  Escuela Uno  " },
    });
    fireEvent.change(screen.getByLabelText(/^ruc/i), {
      target: { value: "  123  " },
    });

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onSave).toHaveBeenCalledWith({
      codigo: "INST-01",
      nombre: "Escuela Uno",
      ruc: "123",
    });
  });
});
