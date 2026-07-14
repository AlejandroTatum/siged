import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { institutionApi } from "@/features/instituciones/services/api";
import { usePlanningAccess } from "../usePlanningAccess";

const ASSIGNED_INSTITUTION = { id: 1, nombre: "Assigned", codigo: "A", ruc: "1", fecha_creacion: "2026-01-01", fecha_actualizacion: null };
const OTHER_INSTITUTION = { id: 2, nombre: "Other", codigo: "B", ruc: "2", fecha_creacion: "2026-01-01", fecha_actualizacion: null };

beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("usePlanningAccess", () => {
  it("transitions to allowed when the institution is in the user's assignments", async () => {
    vi.spyOn(institutionApi, "mine").mockResolvedValue([ASSIGNED_INSTITUTION, OTHER_INSTITUTION] as never);
    const { result } = renderHook(() => usePlanningAccess("token", 1));
    await waitFor(() => expect(result.current.status).toBe("allowed"));
  });

  it("transitions to denied when the institution is not in the user's assignments", async () => {
    vi.spyOn(institutionApi, "mine").mockResolvedValue([OTHER_INSTITUTION] as never);
    const { result } = renderHook(() => usePlanningAccess("token", 1));
    await waitFor(() => expect(result.current.status).toBe("denied"));
  });

  it("transitions to denied when the api rejects", async () => {
    vi.spyOn(institutionApi, "mine").mockRejectedValue(new Error("network down"));
    const { result } = renderHook(() => usePlanningAccess("token", 1));
    await waitFor(() => expect(result.current.status).toBe("denied"));
  });

  it("exposes denied immediately when the institution id is invalid", async () => {
    const { result } = renderHook(() => usePlanningAccess("token", 0));
    expect(result.current.status).toBe("denied");
  });

  it("re-runs the check when retry is invoked", async () => {
    const spy = vi.spyOn(institutionApi, "mine")
      .mockResolvedValueOnce([OTHER_INSTITUTION] as never)
      .mockResolvedValueOnce([ASSIGNED_INSTITUTION] as never);
    const { result } = renderHook(() => usePlanningAccess("token", 1));
    await waitFor(() => expect(result.current.status).toBe("denied"));
    result.current.retry();
    await waitFor(() => expect(result.current.status).toBe("allowed"));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
