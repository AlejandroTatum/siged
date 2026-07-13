from django.db import models
from rest_framework.permissions import BasePermission

from apps.organizacion.models import Rol, UsuarioRol
from apps.organizacion.daos.usuariorol_dao import UsuarioRolDAO


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


class EsAutoridadAcademicaInstitucion(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if view.action == "instituciones":
            institucion_id = view.kwargs.get("institucion_id")
        elif view.action == "create":
            institucion_id = request.data.get("institucion")
            if institucion_id is None:
                return True
        elif view.action == "list":
            return False
        else:
            return True
        return bool(
            institucion_id
            and UsuarioRolDAO.es_autoridad_academica_activa(request.user, institucion_id)
        )

    def has_object_permission(self, request, view, plan):
        return UsuarioRolDAO.es_autoridad_academica_activa(
            request.user, plan.institucion_id
        )


class EsAutoridadAcademicaGrado(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if view.action == "planes_estudio":
            plan_estudio_id = view.kwargs.get("plan_estudio_id")
            institucion_id = view.obtener_institucion_plan(plan_estudio_id)
        elif view.action == "create":
            plan_estudio_id = request.data.get("plan_estudio")
            if plan_estudio_id is None:
                return True
            institucion_id = view.obtener_institucion_plan(plan_estudio_id)
        elif view.action == "list":
            return False
        else:
            return True
        return bool(
            institucion_id
            and UsuarioRolDAO.es_autoridad_academica_activa(request.user, institucion_id)
        )

    def has_object_permission(self, request, view, grado):
        return UsuarioRolDAO.es_autoridad_academica_activa(
            request.user, grado.plan_estudio.institucion_id
        )


class EsAutoridadAcademicaAsignatura(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        if view.action == "grados_escolares":
            grado_escolar_id = view.kwargs.get("grado_escolar_id")
            institucion_id = view.obtener_institucion_grado(grado_escolar_id)
        elif view.action == "create":
            grado_escolar_id = request.data.get("grado_escolar")
            if grado_escolar_id is None:
                return True
            institucion_id = view.obtener_institucion_grado(grado_escolar_id)
        elif view.action == "list":
            return False
        else:
            return True
        return bool(
            institucion_id
            and UsuarioRolDAO.es_autoridad_academica_activa(request.user, institucion_id)
        )

    def has_object_permission(self, request, view, asignatura):
        return UsuarioRolDAO.es_autoridad_academica_activa(
            request.user, asignatura.grado_escolar.plan_estudio.institucion_id
        )
