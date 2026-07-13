from django.db import transaction

from apps.organizacion.daos.institucion_dao import InstitucionDAO
from apps.organizacion.excepciones import InstitucionConAsignacionesActivas


class InstitucionServicio:
    @staticmethod
    def crear(datos):
        return InstitucionDAO.crear(datos)

    @staticmethod
    @transaction.atomic
    def eliminar(pk):
        institucion = InstitucionDAO.obtener_bloqueada(pk)
        if InstitucionDAO.tiene_asignaciones_activas(institucion):
            raise InstitucionConAsignacionesActivas
        InstitucionDAO.eliminar(institucion)

    @staticmethod
    def listar(nombre="", ordering="nombre"):
        return InstitucionDAO.listar(nombre, ordering)

    @staticmethod
    def listar_por_usuario(usuario):
        return InstitucionDAO.listar_por_usuario(usuario)

    @staticmethod
    def actualizar(institucion, datos):
        return InstitucionDAO.actualizar(institucion, datos)
