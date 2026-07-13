from django.db import transaction

from apps.organizacion.daos.asignatura_dao import AsignaturaDAO


class AsignaturaServicio:
    @staticmethod
    @transaction.atomic
    def actualizar(asignatura, datos):
        return AsignaturaDAO.actualizar(asignatura, datos)

    @staticmethod
    @transaction.atomic
    def crear(datos):
        return AsignaturaDAO.crear(datos)

    @staticmethod
    @transaction.atomic
    def eliminar(asignatura):
        AsignaturaDAO.eliminar(asignatura)

    @staticmethod
    def listar(grado_escolar_id):
        return AsignaturaDAO.listar(grado_escolar_id)

    @staticmethod
    def todos():
        return AsignaturaDAO.todos()
