import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InstitutionTable } from "../InstitutionTable";

const institution = {
  id: 1,
  nombre: "Escuela Uno",
  codigo: "UE1",
  ruc: "1",
  fecha_creacion: "",
  fecha_actualizacion: null,
  autoridades_academicas: [],
};

describe("InstitutionTable", () => {
	 it("renders the canonical code header and a spaced accessible action group", () => {
		 render(
			 <InstitutionTable
				 items={[institution]}
				 onAuthorities={vi.fn()}
				 onDelete={vi.fn()}
				 onEdit={vi.fn()}
				 onSort={vi.fn()}
				 ordering="nombre"
			 />,
		 );

		 expect(screen.getByText("Código de institución", { exact: true })).toBeInTheDocument();
		 expect(
			 screen.getByRole("columnheader", { name: /Código de institución/ }),
		 ).toBeInTheDocument();

		 const edit = screen.getByRole("button", { name: "Editar Escuela Uno" });
		 const remove = screen.getByRole("button", { name: "Eliminar Escuela Uno" });
		 const actionGroup = edit.parentElement;

		 expect(actionGroup).toHaveClass("flex", "min-w-48", "flex-wrap", "gap-2");
		 expect(actionGroup).toContainElement(edit);
		 expect(actionGroup).toContainElement(remove);
	 });

	 it("keeps separately named edit and delete actions keyboard-focusable", () => {
    const onDelete = vi.fn();
    const onEdit = vi.fn();

    render(
      <InstitutionTable
        items={[institution]}
        onAuthorities={vi.fn()}
        onDelete={onDelete}
        onEdit={onEdit}
        onSort={vi.fn()}
        ordering="nombre"
      />,
    );

    const edit = screen.getByRole("button", { name: "Editar Escuela Uno" });
    const remove = screen.getByRole("button", { name: "Eliminar Escuela Uno" });
    edit.focus();
    expect(edit).toHaveFocus();
    remove.focus();
    expect(remove).toHaveFocus();
    fireEvent.click(edit);
    fireEvent.click(remove);
    expect(onEdit).toHaveBeenCalledWith(institution);
    expect(onDelete).toHaveBeenCalledWith(institution);
  });

  it("marks the ascending active column with an up arrow and aria-sort", () => {
    render(
      <InstitutionTable
        items={[institution]}
        onAuthorities={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onSort={vi.fn()}
        ordering="nombre"
      />,
    );

    const nombreHeader = screen.getByRole("columnheader", { name: /Nombre de la institución/ });
    expect(nombreHeader).toHaveAttribute("aria-sort", "ascending");
    expect(nombreHeader.querySelector(".material-symbols-outlined")).toHaveTextContent("arrow_upward");

    const codigoHeader = screen.getByRole("columnheader", { name: /Código de institución/ });
    expect(codigoHeader).toHaveAttribute("aria-sort", "none");
    expect(codigoHeader.querySelector(".material-symbols-outlined")).toHaveTextContent("unfold_more");
  });

  it("marks the descending active column with a down arrow and aria-sort", () => {
    render(
      <InstitutionTable
        items={[institution]}
        onAuthorities={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        onSort={vi.fn()}
        ordering="-codigo"
      />,
    );

    const codigoHeader = screen.getByRole("columnheader", { name: /Código de institución/ });
    expect(codigoHeader).toHaveAttribute("aria-sort", "descending");
    expect(codigoHeader.querySelector(".material-symbols-outlined")).toHaveTextContent("arrow_downward");

    const nombreHeader = screen.getByRole("columnheader", { name: /Nombre de la institución/ });
    expect(nombreHeader).toHaveAttribute("aria-sort", "none");
    expect(nombreHeader.querySelector(".material-symbols-outlined")).toHaveTextContent("unfold_more");
  });
});
