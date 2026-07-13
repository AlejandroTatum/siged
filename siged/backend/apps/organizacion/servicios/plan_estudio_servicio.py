from django.db import transaction

from apps.organizacion.daos.plan_estudio_dao import PlanEstudioDAO
from apps.organizacion.excepciones import PlanEstudioActivoExistente, PlanEstudioConGrados


class PlanEstudioServicio:
    @staticmethod
    @transaction.atomic
    def actualizar(plan, datos):
        activo = datos.get("es_activo", plan.es_activo)
        if activo and PlanEstudioDAO.existe_activo(plan.institucion_id, excluir_pk=plan.pk):
            raise PlanEstudioActivoExistente
        return PlanEstudioDAO.actualizar(plan, datos)

    @staticmethod
    @transaction.atomic
    def crear(datos):
        if datos["es_activo"] and PlanEstudioDAO.existe_activo(datos["institucion"].pk):
            raise PlanEstudioActivoExistente
        return PlanEstudioDAO.crear(datos)

    @staticmethod
    @transaction.atomic
    def eliminar(plan):
        if PlanEstudioDAO.tiene_grados(plan):
            raise PlanEstudioConGrados
        PlanEstudioDAO.eliminar(plan)

    @staticmethod
    def listar(institucion_id, nombre="", ordering="nombre"):
        return PlanEstudioDAO.listar(institucion_id, nombre, ordering)

    @staticmethod
    def todos():
        return PlanEstudioDAO.todos()
