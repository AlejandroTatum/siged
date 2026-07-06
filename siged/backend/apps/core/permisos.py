"""
Permisos personalizados para la aplicación Core.
"""

from rest_framework.permissions import SAFE_METHODS, BasePermission


class EsAdministrador(BasePermission):
    """Permite el acceso solo a usuarios administradores (is_staff)."""

    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and request.user.is_staff
        )


class EsPropietarioOLectura(BasePermission):
    """
    Permite escritura solo al propietario del objeto.
    Permite lectura a cualquier usuario autenticado.
    """

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj == request.user
