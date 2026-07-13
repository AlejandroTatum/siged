from django.db import models
from rest_framework.permissions import BasePermission

from apps.organizacion.models import Rol, UsuarioRol


class EsAdministradorActivo(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user.is_authenticated
            and UsuarioRol.objects.filter(
                usuario=request.user, rol__nombre=Rol.ADMINISTRADOR, es_activo=True
            ).exists()
        )


class PuedeVerInstitucion(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, institution):
        return UsuarioRol.objects.filter(
            usuario=request.user,
            rol__nombre__in=[Rol.ADMINISTRADOR, Rol.AUTORIDAD_ACADEMICA],
            es_activo=True,
        ).filter(
            models.Q(rol__nombre=Rol.ADMINISTRADOR)
            | models.Q(rol__nombre=Rol.AUTORIDAD_ACADEMICA, institucion=institution)
        ).exists()
