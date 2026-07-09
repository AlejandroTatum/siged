import { afterEach, describe, expect, it, vi } from "vitest";
import { login, logout } from "@/features/auth/services/authApi";
import { ENDPOINTS } from "@/config/endpoints";

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

describe("authApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call POST /api/login/ with credentials", async () => {
      const credentials = {
        numero_identificacion: "12345678",
        password: "secreta",
      };
      const mockResponse = {
        ok: true,
        json: () =>
          Promise.resolve({
            token: "abc123",
            usuario: {
              id: 1,
              numero_identificacion: "12345678",
              first_name: "Juan",
              last_name: "Pérez",
              is_active: true,
            },
          }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await login(credentials);

      expect(mockFetch).toHaveBeenCalledWith(
        ENDPOINTS.LOGIN,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(credentials),
        }),
      );
      expect(result.token).toBe("abc123");
      expect(result.usuario.numero_identificacion).toBe("12345678");
    });

    it("should throw on failed login", async () => {
      const credentials = {
        numero_identificacion: "wrong",
        password: "wrong",
      };
      const mockResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Credenciales inválidas" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(login(credentials)).rejects.toMatchObject({
        status: 401,
        data: expect.objectContaining({ error: expect.any(String) }),
      });
    });
  });

  describe("logout", () => {
    it("should call POST /api/logout/ with auth header", async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ mensaje: "Sesión cerrada correctamente" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      const result = await logout("token123");

      expect(mockFetch).toHaveBeenCalledWith(
        ENDPOINTS.LOGOUT,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Token token123",
          }),
        }),
      );
      expect(result.mensaje).toBe("Sesión cerrada correctamente");
    });

    it("should throw on logout without token", async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "No autenticado" }),
      };
      mockFetch.mockResolvedValue(mockResponse);

      await expect(logout("invalid-token")).rejects.toMatchObject({
        status: 401,
        data: expect.objectContaining({ error: expect.any(String) }),
      });
    });
  });
});
