"""
URL configuration for SIGED backend.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("apps.core.apis.urls")),
    path("api/", include("apps.organizacion.apis.urls")),
]
