import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlanningForm } from "../PlanningForm";

const level = { id: 3, nombre: "General", pp_minutos: 40, pp_semana_minimo: 30, subniveles: [{ id: 4, nombre: "Básica", pp_semana_minimo: 35 }] };

describe("PlanningForm", () => {
  it("renders a Spanish plan form with disabled submit while busy", () => {
    const onSubmit = vi.fn();
    render(
      <PlanningForm
        active={false}
        busy={true}
        editing={false}
        levelId=""
        levels={[level]}
        name="Plan 2026"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={onSubmit}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="planes"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    const button = screen.getByRole("button", { name: /guardando/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("Guardando…");
  });

  it("shows the new plan heading when not editing", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        name=""
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="planes"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    expect(screen.getByRole("heading", { name: "Nuevo plan" })).toBeInTheDocument();
  });

  it("shows the edit grado heading and cancel button when editing", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={true}
        levelId="3"
        levels={[level]}
        name="First"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order="1"
        section="grados"
        sublevelId="4"
        sublevels={level.subniveles}
        weeklyLoad="1"
      />,
    );
    expect(screen.getByRole("heading", { name: "Editar grado" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("submits with the typed name and active flag for the planes section", () => {
    const onSubmit = vi.fn();
    render(
      <PlanningForm
        active={true}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        name="Plan 2026"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={onSubmit}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="planes"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar plan" }));
    expect(onSubmit).toHaveBeenCalled();
  });

  it("shows the weekly load field for the asignaturas section", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        name=""
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="asignaturas"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="3"
      />,
    );
    expect(screen.getByLabelText(/^Carga semanal mínima/)).toHaveValue(3);
  });

  it("renders a loading state with polite live region while the catalog is being fetched", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        loading={true}
        name=""
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="grados"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/Cargando datos del formulario/i);
    expect(screen.getByTestId("planning-form-loading")).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Nivel educativo/)).not.toBeInTheDocument();
  });

  it("renders the empty state when the grados section has no education levels", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        name=""
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="grados"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    expect(screen.getByTestId("planning-form-empty")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /No hay niveles educativos registrados/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/^Nivel educativo/)).not.toBeInTheDocument();
  });

  it("renders an alert with a retry handler when the form has an error", () => {
    const onRetry = vi.fn();
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        error="No fue posible guardar el registro."
        levelId=""
        levels={[level]}
        name="Plan 2026"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onRetry={onRetry}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="planes"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/No fue posible guardar el registro/i);
    const retry = screen.getByRole("button", { name: /Reintentar/i });
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("planning-form-error")).toBeInTheDocument();
  });

  it("does not render the empty state while editing even when levels is empty", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={true}
        levelId=""
        levels={[]}
        name="Editar"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="planes"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    expect(screen.queryByTestId("planning-form-empty")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Editar plan" })).toBeInTheDocument();
  });

  it("renders a required positive-integer Orden input for the grados section", () => {
    const onOrderChange = vi.fn();
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId="3"
        levels={[level]}
        name="Cuarto"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={onOrderChange}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="grados"
        sublevelId="4"
        sublevels={level.subniveles}
        weeklyLoad="1"
      />,
    );
    const orden = screen.getByLabelText(/^Orden/) as HTMLInputElement;
    expect(orden).toBeRequired();
    expect(orden).toHaveAttribute("type", "number");
    expect(orden).toHaveAttribute("min", "1");
    expect(orden).toHaveAttribute("step", "1");
    expect(orden).toHaveValue(null);
    fireEvent.change(orden, { target: { value: "5" } });
    expect(onOrderChange).toHaveBeenCalledWith("5");
  });

  it("hydrates the Orden input from the persisted item value when editing", () => {
    render(
      <PlanningForm
        active={false}
        busy={false}
        editing={true}
        levelId="3"
        levels={[level]}
        name="Cuarto"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order="7"
        section="grados"
        sublevelId="4"
        sublevels={level.subniveles}
        weeklyLoad="1"
      />,
    );
    const orden = screen.getByLabelText(/^Orden/) as HTMLInputElement;
    expect(orden).toHaveValue(7);
  });

  it("does not render the Orden input for planes or asignaturas sections", () => {
    const { rerender } = render(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        name="Plan"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="planes"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="1"
      />,
    );
    expect(screen.queryByLabelText(/^Orden/)).not.toBeInTheDocument();
    rerender(
      <PlanningForm
        active={false}
        busy={false}
        editing={false}
        levelId=""
        levels={[]}
        name="Math"
        onActiveChange={vi.fn()}
        onCancel={vi.fn()}
        onLevelChange={vi.fn()}
        onNameChange={vi.fn()}
        onOrderChange={vi.fn()}
        onSubmit={vi.fn()}
        onSublevelChange={vi.fn()}
        onWeeklyLoadChange={vi.fn()}
        order=""
        section="asignaturas"
        sublevelId=""
        sublevels={[]}
        weeklyLoad="3"
      />,
    );
    expect(screen.queryByLabelText(/^Orden/)).not.toBeInTheDocument();
  });
});
