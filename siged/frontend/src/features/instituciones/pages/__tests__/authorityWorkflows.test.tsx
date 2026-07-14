import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthContext } from "@/features/auth/context/AuthContext";
import { InstitutionListPage } from "../InstitutionListPage";

const auth: any = { token: "token", user: null, activeRoles: [], login: vi.fn(), logout: vi.fn(), isLoading: false };
const institution = { id: 1, nombre: "Escuela Uno", codigo: "UE1", ruc: "1", fecha_creacion: "", fecha_actualizacion: null, autoridades_academicas: [] };
const authority = { id: 8, usuario: { id: 2, username: "inactive", first_name: "Ana", last_name: "Paz" }, rol: { id: 77, nombre: "AUTORIDAD_ACADEMICA" }, es_activo: true, fecha_desde: "2026-01-01" };
const response = (data: unknown, ok = true, status = 200) => ({ ok, status, json: async () => data }) as Response;

function mount() {
  return render(<MemoryRouter><AuthContext.Provider value={auth}><InstitutionListPage /></AuthContext.Provider></MemoryRouter>);
}

describe("academic authority assignment workflows", () => {
  beforeEach(() => {
    vi.stubGlobal("confirm", vi.fn(() => true));
  });

  it("creates, edits, deactivates, activates and deletes while refreshing the main table after each success", async () => {
    let assignments = [authority];
    let institutionLoads = 0;
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/instituciones/?")) { institutionLoads += 1; return response({ count: 1, next: null, previous: null, results: [institution] }); }
      if (url === "/api/roles/") return response([{ id: 3, nombre: "DOCENTE" }, { id: 77, nombre: "AUTORIDAD_ACADEMICA" }]);
      if (url === "/api/usuarios/?activo=true") return response([{ id: 4, username: "active", first_name: "Eva", last_name: "Sol" }]);
      if (url === "/api/usuarios/") return response([{ id: 2, username: "inactive", first_name: "Ana", last_name: "Paz", is_active: false }]);
      if (url.includes("/api/usuarioroles/?institucion=")) return response(assignments);
      if (url === "/api/usuarioroles/" && options?.method === "POST") { assignments = [authority]; return response(authority, true, 201); }
      if (url === "/api/usuarioroles/8/" && options?.method === "PATCH") return response(authority);
      if (url === "/api/usuarioroles/8/estado/" && options?.method === "PATCH") { assignments = [{ ...authority, es_activo: !assignments[0]!.es_activo }]; return response(assignments[0]); }
      if (url === "/api/usuarioroles/8/" && options?.method === "DELETE") { assignments = []; return response(null, true, 204); }
      throw new Error(`Unexpected request ${options?.method ?? "GET"} ${url}`);
    }));

    mount();
    await screen.findByText("Escuela Uno");
    fireEvent.click(screen.getByText("Gestionar"));
    await screen.findByText(/Ana Paz — Activa/);

    fireEvent.click(screen.getByRole("button", { name: "Agregar autoridad" }));
    const createSelect = await screen.findByLabelText("Usuario");
    expect(screen.getByRole("option", { name: /Eva Sol/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Ana Paz/ })).not.toBeInTheDocument();
    fireEvent.change(createSelect, { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() => expect(institutionLoads).toBe(2));
    expect(fetch).toHaveBeenCalledWith("/api/usuarioroles/", expect.objectContaining({ method: "POST", body: JSON.stringify({ usuario: 4, rol: 77, institucion: 1 }) }));
    await screen.findByText("Autoridad académica agregada exitosamente.");

    fireEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(await screen.findByRole("option", { name: /Ana Paz/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /Eva Sol/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    await waitFor(() => expect(institutionLoads).toBe(3));
    await screen.findByText("Autoridad académica actualizada exitosamente.");
    fireEvent.click(screen.getByRole("button", { name: "Desactivar" }));
    await waitFor(() => expect(institutionLoads).toBe(4));
    await screen.findByText("Autoridad académica desactivada exitosamente.");
    fireEvent.click(screen.getByRole("button", { name: "Activar" }));
    await waitFor(() => expect(institutionLoads).toBe(5));
    await screen.findByText("Autoridad académica activada exitosamente.");
    fireEvent.click(screen.getByRole("button", { name: "Eliminar" }));
    await waitFor(() => expect(institutionLoads).toBe(6));
    await screen.findByText("Asignación eliminada exitosamente.");
  });

  it("presents the documented mutation error and handles the rejection", async () => {
    const unhandled = vi.fn();
    window.addEventListener("unhandledrejection", unhandled);
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/instituciones/?")) return response({ count: 1, next: null, previous: null, results: [institution] });
      if (url === "/api/roles/") return response([{ id: 77, nombre: "AUTORIDAD_ACADEMICA" }]);
      if (url.includes("/api/usuarioroles/?")) return response([authority]);
      if (url.endsWith("/estado/") && options?.method === "PATCH") return response({ non_field_errors: ["Ya existe una asignación activa para este usuario, rol e institución."] }, false, 400);
      throw new Error(`Unexpected request ${url}`);
    }));
    mount();
    await screen.findByText("Escuela Uno");
    fireEvent.click(screen.getByText("Gestionar"));
    fireEvent.click(await screen.findByRole("button", { name: "Desactivar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Ya existe una asignación activa para este usuario, rol e institución.");
    await Promise.resolve();
    expect(unhandled).not.toHaveBeenCalled();
    window.removeEventListener("unhandledrejection", unhandled);
  });

  it.each(["/api/usuarioroles/?institucion=1", "/api/roles/"])(
    "presents a stable error when loading %s is rejected",
    async (rejectedUrl) => {
      const unhandled = vi.fn();
      window.addEventListener("unhandledrejection", unhandled);
      vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes("/api/instituciones/?")) return response({ count: 1, next: null, previous: null, results: [institution] });
        if (url === rejectedUrl) throw new Error("Network unavailable");
        if (url === "/api/roles/") return response([{ id: 77, nombre: "AUTORIDAD_ACADEMICA" }]);
        if (url.includes("/api/usuarioroles/?")) return response([authority]);
        throw new Error(`Unexpected request ${url}`);
      }));

      mount();
      await screen.findByText("Escuela Uno");
      fireEvent.click(screen.getByText("Gestionar"));

      expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron cargar las autoridades académicas.");
      await Promise.resolve();
      expect(unhandled).not.toHaveBeenCalled();
      window.removeEventListener("unhandledrejection", unhandled);
    },
  );

  it("shows a validation message and skips the API call when saving without selecting a user", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, options?: RequestInit) => {
      const url = String(input);
      if (url.includes("/api/instituciones/?")) return response({ count: 1, next: null, previous: null, results: [institution] });
      if (url === "/api/roles/") return response([{ id: 77, nombre: "AUTORIDAD_ACADEMICA" }]);
      if (url.includes("/api/usuarioroles/?institucion=")) return response([]);
      if (url === "/api/usuarios/?activo=true") return response([{ id: 4, username: "active", first_name: "Eva", last_name: "Sol" }]);
      if (url === "/api/usuarioroles/" && options?.method === "POST") throw new Error("should not be called");
      throw new Error(`Unexpected request ${options?.method ?? "GET"} ${url}`);
    }));

    mount();
    await screen.findByText("Escuela Uno");
    fireEvent.click(screen.getByText("Gestionar"));
    fireEvent.click(screen.getByRole("button", { name: "Agregar autoridad" }));
    await screen.findByLabelText("Usuario");

    const postCallsBefore = vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === "POST").length;
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Selecciona un usuario.");
    const postCallsAfter = vi.mocked(fetch).mock.calls.filter(([, options]) => options?.method === "POST").length;
    expect(postCallsAfter).toBe(postCallsBefore);
  });

  it("presents a stable error when loading authority users is rejected", async () => {
    const unhandled = vi.fn();
    window.addEventListener("unhandledrejection", unhandled);
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/instituciones/?")) return response({ count: 1, next: null, previous: null, results: [institution] });
      if (url === "/api/roles/") return response([{ id: 77, nombre: "AUTORIDAD_ACADEMICA" }]);
      if (url.includes("/api/usuarioroles/?")) return response([authority]);
      if (url === "/api/usuarios/?activo=true") throw new Error("Network unavailable");
      throw new Error(`Unexpected request ${url}`);
    }));

    mount();
    await screen.findByText("Escuela Uno");
    fireEvent.click(screen.getByText("Gestionar"));
    await screen.findByText(/Ana Paz — Activa/);
    fireEvent.click(screen.getByRole("button", { name: "Agregar autoridad" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron cargar los usuarios.");
    await Promise.resolve();
    expect(unhandled).not.toHaveBeenCalled();
    window.removeEventListener("unhandledrejection", unhandled);
  });
});
