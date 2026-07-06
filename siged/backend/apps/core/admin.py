"""
Configuración del panel de administración para el modelo Usuario.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from apps.core.models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(BaseUserAdmin):
    """
    Configuración del admin para Usuario.

    Personaliza el panel de administración para mostrar
    los campos relevantes del modelo Usuario.
    """

    fieldsets = (
        (None, {"fields": ("numero_identificacion", "password")}),
        (
            "Información personal",
            {"fields": ("first_name", "last_name", "email")},
        ),
        (
            "Permisos",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (
            "Fechas importantes",
            {"fields": ("last_login", "date_joined")},
        ),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "numero_identificacion",
                    "password1",
                    "password2",
                ),
            },
        ),
    )
    list_display = (
        "numero_identificacion",
        "first_name",
        "last_name",
        "is_active",
        "is_staff",
    )
    list_filter = ("is_active", "is_staff", "is_superuser")
    search_fields = ("numero_identificacion", "first_name", "last_name")
    ordering = ("numero_identificacion",)
    filter_horizontal = ("groups", "user_permissions")
