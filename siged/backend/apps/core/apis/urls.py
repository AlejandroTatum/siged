"""
Registro de rutas para la API de autenticación.
"""

from django.urls import path

from apps.core.apis.views import login_view, logout_view, usuarios_view

urlpatterns = [
    path("login/", login_view, name="api-login"),
    path("logout/", logout_view, name="api-logout"),
    path("usuarios/", usuarios_view, name="api-usuarios"),
]
