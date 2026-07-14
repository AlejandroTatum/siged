import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { planningApi } from "../../api";
import { usePlanningData } from "../usePlanningData";

const level = { id: 3, nombre: "General", pp_minutos: 40, pp_semana_minimo: 30, subniveles: [] };
const plan = { id: 7, nombre: "Plan 2026", es_activo: true };
const plansPage = { count: 1, next: null, previous: null, results: [plan] };

const baseOptions = { token: "token", institutionId: 1, parentId: 0, allowed: true } as const;

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePlanningData", () => {
  it("loads plans and reaches success status", async () => {
    vi.spyOn(planningApi, "plans").mockResolvedValue(plansPage as never);
    const { result } = renderHook(() => usePlanningData({ ...baseOptions, section: "planes" }));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toEqual([plan]);
  });

  it("reports the empty result set and not an error", async () => {
    vi.spyOn(planningApi, "plans").mockResolvedValue({ count: 0, next: null, previous: null, results: [] } as never);
    const { result } = renderHook(() => usePlanningData({ ...baseOptions, section: "planes" }));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBe("");
  });

  it("transitions to error status when the api rejects and exposes retry", async () => {
    const spy = vi.spyOn(planningApi, "plans")
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce(plansPage as never);
    const { result } = renderHook(() => usePlanningData({ ...baseOptions, section: "planes" }));
    await waitFor(() => expect(result.current.status).toBe("error"));
    expect(result.current.error).toBe("boom");
    await result.current.reload();
    expect(spy).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.status).toBe("success"));
  });

  it("does not load when access is not allowed", async () => {
    const spy = vi.spyOn(planningApi, "plans").mockResolvedValue(plansPage as never);
    const { result } = renderHook(() => usePlanningData({ ...baseOptions, section: "planes", allowed: false }));
    expect(spy).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });

  it("loads levels for the catalog section", async () => {
    vi.spyOn(planningApi, "levels").mockResolvedValue([level] as never);
    const { result } = renderHook(() => usePlanningData({ ...baseOptions, section: "catalogo" }));
    await waitFor(() => expect(result.current.status).toBe("success"));
    expect(result.current.levels).toEqual([level]);
  });

  it("updates items when the search term changes", async () => {
    const spy = vi.spyOn(planningApi, "plans").mockResolvedValue(plansPage as never);
    const { result } = renderHook(() => usePlanningData({ ...baseOptions, section: "planes" }));
    await waitFor(() => expect(result.current.status).toBe("success"));
    act(() => {
      result.current.setSearch("Plan");
    });
    expect(result.current.search).toBe("Plan");
    expect(result.current.page).toBe(1);
    await waitFor(() => expect(spy.mock.calls.length).toBeGreaterThanOrEqual(2));
  });
});
