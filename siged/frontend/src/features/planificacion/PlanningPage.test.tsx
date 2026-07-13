import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { institutionApi } from "@/features/instituciones/services/api";
import { planningApi } from "./api";
import { PlanningPage } from "./PlanningPage";

const page = (results: object[]) => ({ count: results.length, next: null, previous: null, results });
const level = { id: 3, nombre: "General", pp_minutos: 40, pp_semana_minimo: 30,
  subniveles: [{ id: 4, nombre: "Básica", pp_semana_minimo: 35 }] };
const grade = { id: 8, nombre: "First", orden: 1, nivel: { id: 3, nombre: "General" },
  subnivel: { id: 4, nombre: "Básica" }, carga_pedagogica_actual: 20,
  carga_pedagogica_minima: 35, alerta_carga_pedagogica: true };

function renderPage(path = "/instituciones/1/planificacion/planes") {
  return render(<AuthContext.Provider value={{ token: "token", user: null, activeRoles: [], login: vi.fn(), logout: vi.fn(), isLoading: false }}>
    <MemoryRouter initialEntries={[path]}><Routes>
      <Route path="/instituciones/:institutionId/planificacion/:section" element={<PlanningPage />} />
      <Route path="/mis-instituciones" element={<p>Institutions</p>} />
    </Routes></MemoryRouter>
  </AuthContext.Provider>);
}

afterEach(() => vi.restoreAllMocks());
beforeEach(() => {
  vi.spyOn(institutionApi, "mine").mockResolvedValue([
    { id: 1, nombre: "Assigned", codigo: "A", ruc: "1", fecha_creacion: "2026-01-01", fecha_actualizacion: null },
  ]);
});

describe("PlanningPage", () => {
  it("blocks a direct route without a valid institution context", async () => {
    renderPage("/instituciones/invalid/planificacion/planes");
    expect(await screen.findByText("Institutions")).toBeInTheDocument();
    expect(screen.queryByText("Curriculum planning")).not.toBeInTheDocument();
  });

  it("blocks a positive numeric institution outside the user's active assignments", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");
    renderPage("/instituciones/2/planificacion/planes");
    expect(await screen.findByText("Institutions")).toBeInTheDocument();
    expect(screen.queryByText("Curriculum planning")).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("loads plans and exposes institution-context navigation and empty state", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(page([])), { status: 200 }));
    renderPage();
    expect(await screen.findByText("No study plans found.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Grades" })).toHaveAttribute("href", "/instituciones/1/planificacion/planes");
    expect(screen.getByRole("link", { name: "Subjects" })).toBeInTheDocument();
  });

  it("carries selected plan and grade IDs through contextual navigation", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response(JSON.stringify(page([
      { id: 7, nombre: "Plan 2026", es_activo: true },
    ])), { status: 200 }));
    renderPage();
    expect(await screen.findByRole("link", { name: "Manage grades for Plan 2026" })).toHaveAttribute(
      "href", "/instituciones/1/planificacion/grados?plan=7",
    );
  });

  it("carries the selected grade ID to its subject route", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify([level]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page([
        grade,
      ])), { status: 200 }));
    renderPage("/instituciones/1/planificacion/grados?plan=7");
    expect(await screen.findByRole("link", { name: "Manage subjects for First" })).toHaveAttribute(
      "href", "/instituciones/1/planificacion/asignaturas?grado=8",
    );
  });

  it("loads the read-only level catalog inside institution context", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([level]), { status: 200 }));
    renderPage("/instituciones/1/planificacion/catalogo");
    expect(await screen.findByText("General")).toBeInTheDocument();
    expect(screen.getByText("Básica")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
  });

  it("creates a plan and reloads the list", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(page([])), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 7, nombre: "Plan 2026", es_activo: true }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page([{ id: 7, nombre: "Plan 2026", es_activo: true }])), { status: 200 }));
    renderPage();
    await screen.findByText("No study plans found.");
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Plan 2026" } });
    fireEvent.click(screen.getByLabelText("Active"));
    fireEvent.click(screen.getByRole("button", { name: "Save plan" }));
    expect(await screen.findByText("Plan 2026")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("updates and deletes planning records through confirmed actions", async () => {
    const original = { id: 7, nombre: "Plan old", es_activo: false };
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify(page([original])), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...original, nombre: "Plan new" }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page([{ ...original, nombre: "Plan new" }])), { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page([])), { status: 200 }));
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    renderPage();
    fireEvent.click(await screen.findByRole("button", { name: "Edit Plan old" }));
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Plan new" } });
    fireEvent.click(screen.getByRole("button", { name: "Update plan" }));
    expect(await screen.findByText("Plan new")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete Plan new" }));
    expect(await screen.findByText("No study plans found.")).toBeInTheDocument();
    expect(fetchMock.mock.calls[1]![1]).toMatchObject({ method: "PATCH" });
    expect(fetchMock.mock.calls[3]![1]).toMatchObject({ method: "DELETE" });
  });

  it("uses catalog selects for grades and shows refreshed load alerts", async () => {
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify([level]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(page([grade])), { status: 200 }));
    renderPage("/instituciones/1/planificacion/grados?plan=2");
    expect(await screen.findByRole("alert")).toHaveTextContent("20 / 35");
    expect(screen.getByLabelText("Level")).toHaveTextContent("General");
    expect(screen.getByLabelText("Sublevel")).toHaveTextContent("Básica");
  });

  it("hydrates grade edit selects from nested serializer objects", async () => {
    vi.spyOn(planningApi, "levels").mockResolvedValue([level]);
    vi.spyOn(planningApi, "grades").mockResolvedValue(page([grade]) as never);

    renderPage("/instituciones/1/planificacion/grados?plan=2");
    fireEvent.click(await screen.findByRole("button", { name: "Edit First" }));

    expect(screen.getByLabelText("Level")).toHaveValue("3");
    expect(screen.getByLabelText("Sublevel")).toHaveValue("4");
  });

  it("keeps the required sublevel blank until the user selects one", async () => {
    vi.spyOn(planningApi, "levels").mockResolvedValue([level]);
    vi.spyOn(planningApi, "grades").mockResolvedValue(page([]) as never);

    renderPage("/instituciones/1/planificacion/grados?plan=2");
    await screen.findByText("No grades found.");
    fireEvent.change(screen.getByLabelText("Level"), { target: { value: "3" } });

    expect(screen.getByLabelText("Sublevel")).toHaveValue("");
    expect(screen.getByRole("option", { name: "Seleccione un subnivel" })).toHaveValue("");
  });

  it("creates a grade after a middle deletion with the next unused order", async () => {
    const grades = [
      { ...grade, id: 1, nombre: "First", orden: 1 },
      { ...grade, id: 2, nombre: "Second", orden: 2 },
      { ...grade, id: 3, nombre: "Third", orden: 3 },
    ];
    vi.spyOn(planningApi, "levels").mockResolvedValue([level]);
    vi.spyOn(planningApi, "grades")
      .mockResolvedValueOnce(page(grades) as never)
      .mockResolvedValue(page([grades[0]!, grades[2]!]) as never);
    vi.spyOn(planningApi, "remove").mockResolvedValue(undefined);
    const createGrade = vi.spyOn(planningApi, "createGrade").mockResolvedValue(grades[2] as never);
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);

    renderPage("/instituciones/1/planificacion/grados?plan=2");
    fireEvent.click(await screen.findByRole("button", { name: "Delete Second" }));
    await waitFor(() => expect(screen.queryByText("Second")).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Fourth" } });
    fireEvent.change(screen.getByLabelText("Level"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Sublevel"), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Save grade" }));

    await waitFor(() => expect(createGrade).toHaveBeenCalledWith("token", 2, expect.objectContaining({ orden: 4 })));
  });

  it("loads the subject array and creates with the canonical payload", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 8, nombre: "Science", pp_semana_minimo: 4 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...grade, carga_pedagogica_actual: 4 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ id: 9, nombre: "Math", pp_semana_minimo: 5, grado_escolar: 4 }), { status: 201 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: 8, nombre: "Science", pp_semana_minimo: 4 }, { id: 9, nombre: "Math", pp_semana_minimo: 5 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...grade, carga_pedagogica_actual: 9 }), { status: 200 }));
    renderPage("/instituciones/1/planificacion/asignaturas?grado=4");
    await screen.findByText("Science");
    fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Math" } });
    fireEvent.change(screen.getByLabelText("Weekly load"), { target: { value: "5" } });
    fireEvent.click(screen.getByRole("button", { name: "Save subject" }));
    expect(await screen.findByText("Math")).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[2]![1]!.body as string)).toEqual({
      nombre: "Math", pp_semana_minimo: 5, grado_escolar: 4,
    });
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(5));
  });

  it("updates a subject with only canonical editable fields", async () => {
    const subject = { id: 9, nombre: "Math", pp_semana_minimo: 5 };
    vi.spyOn(planningApi, "subjects").mockResolvedValue([subject]);
    vi.spyOn(planningApi, "grade").mockResolvedValue(grade);
    const update = vi.spyOn(planningApi, "update").mockResolvedValue(subject);

    renderPage("/instituciones/1/planificacion/asignaturas?grado=4");
    fireEvent.click(await screen.findByRole("button", { name: "Edit Math" }));
    fireEvent.change(screen.getByLabelText("Weekly load"), { target: { value: "6" } });
    fireEvent.click(screen.getByRole("button", { name: "Update subject" }));

    await waitFor(() => expect(update).toHaveBeenCalledWith("token", "asignaturas", 9, {
      nombre: "Math", pp_semana_minimo: 6,
    }));
  });

  it("shows and refreshes the grade alert when the grade has no subjects", async () => {
    const subjects = [{ id: 9, nombre: "Math", pp_semana_minimo: 5 }];
    vi.spyOn(planningApi, "subjects")
      .mockResolvedValueOnce(subjects)
      .mockResolvedValueOnce([]);
    vi.spyOn(planningApi, "grade")
      .mockResolvedValueOnce({ ...grade, carga_pedagogica_actual: 5, carga_pedagogica_minima: 30 } as never)
      .mockResolvedValueOnce({ ...grade, carga_pedagogica_actual: 0, carga_pedagogica_minima: 30 } as never);
    vi.spyOn(planningApi, "remove").mockResolvedValue(undefined);
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);

    renderPage("/instituciones/1/planificacion/asignaturas?grado=4");
    expect(await screen.findByRole("alert")).toHaveTextContent("5 / 30");
    fireEvent.click(screen.getByRole("button", { name: "Delete Math" }));

    expect(await screen.findByText("No subjects found.")).toBeInTheDocument();
    expect(await screen.findByRole("alert")).toHaveTextContent("0 / 30");
  });
});
