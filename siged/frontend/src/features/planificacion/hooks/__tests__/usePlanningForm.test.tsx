import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { planningApi } from "../../api";
import type { Level } from "../../types";
import { usePlanningForm } from "../usePlanningForm";

const level: Level = { id: 3, nombre: "General", pp_minutos: 40, pp_semana_minimo: 30, subniveles: [{ id: 4, nombre: "Básica", pp_semana_minimo: 35 }] };
const grade = { id: 8, nombre: "First", orden: 1, nivel: { id: 3, nombre: "General" }, subnivel: { id: 4, nombre: "Básica" }, carga_pedagogica_actual: 20, carga_pedagogica_minima: 35, alerta_carga_pedagogica: true };

const baseOptions = {
  token: "token",
  section: "grados",
  institutionId: 1,
  parentId: 7,
  items: [] as never[],
  levels: [level] as Level[],
  reload: vi.fn().mockResolvedValue(undefined),
};

beforeEach(() => {
  vi.restoreAllMocks();
  baseOptions.reload.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePlanningForm", () => {
  it("separates field validation errors from non-field errors for every planning form", async () => {
    vi.spyOn(planningApi, "createGrade").mockRejectedValue(Object.assign(new Error("No fue posible guardar el registro."), {
      status: 400,
      data: {
        nombre: ["Este nombre ya existe."],
        nivel: ["Selecciona un nivel válido."],
        orden: ["El orden ya está ocupado."],
        non_field_errors: ["El grado no es válido para este plan."],
      },
    }));
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));
    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setField("order", "1");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.fieldErrors).toEqual({
      nombre: ["Este nombre ya existe."],
      nivel: ["Selecciona un nivel válido."],
      orden: ["El orden ya está ocupado."],
    });
    expect(result.current.error).toBe("El grado no es válido para este plan.");
  });

  it("shows a generic global error for an unstructured failure", async () => {
    vi.spyOn(planningApi, "createGrade").mockRejectedValue("network failure");
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));
    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setField("order", "1");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.error).toBe("No fue posible guardar el registro.");
    expect(result.current.fieldErrors).toEqual({});
  });

  it("creates a grade and resets the draft", async () => {
    const spy = vi.spyOn(planningApi, "createGrade").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));
    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setField("order", "1");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });
    let ok = false;
    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok).toBe(true);
    expect(spy).toHaveBeenCalledWith("token", 7, expect.objectContaining({ nombre: "Cuarto", nivel: 3, subnivel: 4, orden: 1 }));
    expect(result.current.draft.name).toBe("");
    expect(result.current.draft.order).toBe("");
    expect(result.current.editingId).toBeNull();
  });

  it("refuses to submit when the sublevel is required but missing", async () => {
    vi.spyOn(planningApi, "createGrade").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));
    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setLevel("3");
    });
    let ok = true;
    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok).toBe(false);
    expect(result.current.error).toMatch(/subnivel/i);
  });

  it("updates a grade with canonical editable fields", async () => {
    const spy = vi.spyOn(planningApi, "update").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions, items: [grade] as never }));
    act(() => {
      result.current.edit(grade as never);
    });
    expect(result.current.draft.name).toBe("First");
    act(() => {
      result.current.setField("name", "First Updated");
    });
    let ok = false;
    await act(async () => {
      ok = await result.current.submit();
    });
    expect(ok).toBe(true);
    expect(spy).toHaveBeenCalledWith("token", "grados", 8, expect.objectContaining({ nombre: "First Updated" }));
  });

  it("exposes a busy status during the mutation and clears it after", async () => {
    let resolveCreate: (value: unknown) => void = () => undefined;
    vi.spyOn(planningApi, "createGrade").mockImplementation(
      () => new Promise((resolve) => {
        resolveCreate = resolve;
      }) as never,
    );
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));
    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setField("order", "1");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });
    let submitPromise: Promise<boolean> = Promise.resolve(true);
    act(() => {
      submitPromise = result.current.submit();
    });
    expect(result.current.status).toBe("busy");
    await act(async () => {
      resolveCreate(grade);
      await submitPromise;
    });
    expect(result.current.status).toBe("idle");
  });

  it("removes an item after confirmation and refreshes the list", async () => {
    const remove = vi.spyOn(planningApi, "remove").mockResolvedValue(undefined as never);
    vi.spyOn(globalThis, "confirm").mockReturnValue(true);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions, items: [grade] as never }));
    let ok = false;
    await act(async () => {
      ok = await result.current.remove(grade as never);
    });
    expect(ok).toBe(true);
    expect(remove).toHaveBeenCalledWith("token", "grados", 8);
    expect(baseOptions.reload).toHaveBeenCalled();
  });

  it("cancels a removal when the user declines the confirmation", async () => {
    const remove = vi.spyOn(planningApi, "remove").mockResolvedValue(undefined as never);
    vi.spyOn(globalThis, "confirm").mockReturnValue(false);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions, items: [grade] as never }));
    let ok = true;
    await act(async () => {
      ok = await result.current.remove(grade as never);
    });
    expect(ok).toBe(false);
    expect(remove).not.toHaveBeenCalled();
  });

  it("starts the order draft as an empty string and resets it to empty after create", async () => {
    vi.spyOn(planningApi, "createGrade").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));

    expect(result.current.draft.order).toBe("");

    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setField("order", "3");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(result.current.draft.order).toBe("");
  });

  it("preserves the exact persisted orden on edit and submits it unchanged when untouched", async () => {
    const spy = vi.spyOn(planningApi, "update").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions, items: [grade] as never }));

    act(() => {
      result.current.edit(grade as never);
    });

    expect(result.current.draft.order).toBe("1");

    await act(async () => {
      await result.current.submit();
    });

    expect(spy).toHaveBeenCalledWith(
      "token",
      "grados",
      8,
      expect.objectContaining({ orden: 1 }),
    );
  });

  it("submits the exact user-entered order on edit (no auto-generation, no normalization)", async () => {
    const spy = vi.spyOn(planningApi, "update").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions, items: [grade] as never }));

    act(() => {
      result.current.edit(grade as never);
    });
    act(() => {
      result.current.setField("order", "42");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(spy).toHaveBeenCalledWith(
      "token",
      "grados",
      8,
      expect.objectContaining({ orden: 42 }),
    );
  });

  it("refuses to submit when order is empty on create", async () => {
    const spy = vi.spyOn(planningApi, "createGrade").mockResolvedValue(grade as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));

    act(() => {
      result.current.setField("name", "Cuarto");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });
    expect(result.current.draft.order).toBe("");

    let ok = true;
    await act(async () => {
      ok = await result.current.submit();
    });

    expect(ok).toBe(false);
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.error).toMatch(/orden/i);
  });

  it("rejects non-positive-integer order values before any API call", async () => {
    const cases = ["0", "-1", "1.5", "abc", "1a"];
    for (const bad of cases) {
      const spy = vi.spyOn(planningApi, "createGrade").mockResolvedValue(grade as never);
      const { result } = renderHook(() => usePlanningForm({ ...baseOptions }));

      act(() => {
        result.current.setField("name", "Cuarto");
        result.current.setField("order", bad);
        result.current.setLevel("3");
        result.current.setField("sublevelId", "4");
      });

      let ok = true;
      await act(async () => {
        ok = await result.current.submit();
      });

      expect(ok).toBe(false);
      expect(spy).not.toHaveBeenCalled();
      expect(result.current.error).toMatch(/orden/i);
    }
  });

  it("submits the explicit user-entered order on create (no max-plus-one generation)", async () => {
    const grades = [
      { ...grade, id: 1, nombre: "First", orden: 1 },
      { ...grade, id: 2, nombre: "Second", orden: 2 },
      { ...grade, id: 3, nombre: "Third", orden: 3 },
    ];
    const spy = vi.spyOn(planningApi, "createGrade").mockResolvedValue({ ...grade, id: 4, orden: 7 } as never);
    const { result } = renderHook(() => usePlanningForm({ ...baseOptions, items: grades as never }));

    act(() => {
      result.current.setField("name", "Seventh");
      result.current.setField("order", "7");
      result.current.setLevel("3");
      result.current.setField("sublevelId", "4");
    });

    await act(async () => {
      await result.current.submit();
    });

    expect(spy).toHaveBeenCalledWith(
      "token",
      7,
      expect.objectContaining({ orden: 7, nombre: "Seventh" }),
    );
  });
});
