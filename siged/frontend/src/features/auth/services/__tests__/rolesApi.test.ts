import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActiveRoles } from "@/features/auth/services/authApi";

describe("getActiveRoles", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("uses the centralized endpoint and existing Token header", async () => {
    const roles = [{ id: 1, nombre: "ADMINISTRADOR", nombre_display: "Administrador" }];
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(roles), { status: 200 }));

    await expect(getActiveRoles("session-token")).resolves.toEqual(roles);
    expect(fetch).toHaveBeenCalledWith("/api/usuarioroles/roles/", expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Token session-token" }),
    }));
  });

  it("surfaces the backend status and body when role loading fails", async () => {
    const body = { detail: "Las credenciales de autenticación no se proporcionaron." };
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(body), { status: 401 }));
    await expect(getActiveRoles("expired-token")).rejects.toEqual({ status: 401, data: body });
  });
});
