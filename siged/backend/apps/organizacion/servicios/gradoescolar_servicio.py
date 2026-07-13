from django.db import transaction

from apps.organizacion.daos.gradoescolar_dao import GradoEscolarDAO
from apps.organizacion.excepciones import GradoEscolarConAsignaturas


class GradoEscolarServicio:
    @staticmethod
    @transaction.atomic
    def actualizar(grado, datos):
        return GradoEscolarDAO.actualizar(grado, datos)

    @staticmethod
    @transaction.atomic
    def crear(datos):
        return GradoEscolarDAO.crear(datos)

    @staticmethod
    @transaction.atomic
    def eliminar(grado):
        if GradoEscolarDAO.tiene_asignaturas(grado):
            raise GradoEscolarConAsignaturas
        GradoEscolarDAO.eliminar(grado)

    @staticmethod
    def listar(plan_estudio_id, nombre="", ordering="orden"):
        return GradoEscolarDAO.listar(plan_estudio_id, nombre, ordering)

    @staticmethod
    def todos():
        return GradoEscolarDAO.todos()
