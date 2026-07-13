from django.db.models import Sum
from django.db.models.functions import Coalesce

from apps.organizacion.models import GradoEscolar


class GradoEscolarDAO:
    @staticmethod
    def actualizar(grado, datos):
        for campo, valor in datos.items():
            setattr(grado, campo, valor)
        grado.save()
        return grado

    @staticmethod
    def crear(datos):
        return GradoEscolar.objects.create(**datos)

    @staticmethod
    def eliminar(grado):
        grado.delete()

    @staticmethod
    def existe_nombre(plan_estudio_id, nombre, excluir_pk=None):
        queryset = GradoEscolar.objects.filter(
            plan_estudio_id=plan_estudio_id, nombre=nombre
        )
        return queryset.exclude(pk=excluir_pk).exists() if excluir_pk else queryset.exists()

    @staticmethod
    def listar(plan_estudio_id, nombre="", ordering="orden"):
        ordering_map = {
            "nivel": "nivel__nombre",
            "-nivel": "-nivel__nombre",
            "subnivel": "subnivel__nombre",
            "-subnivel": "-subnivel__nombre",
        }
        return (
            GradoEscolarDAO.todos()
            .filter(plan_estudio_id=plan_estudio_id, nombre__icontains=nombre)
            .order_by(ordering_map.get(ordering, ordering), "pk")
        )

    @staticmethod
    def tiene_asignaturas(grado):
        return grado.asignaturas.exists()

    @staticmethod
    def todos():
        return (
            GradoEscolar.objects.select_related("plan_estudio__institucion", "nivel", "subnivel")
            .annotate(carga_pedagogica_actual=Coalesce(Sum("asignaturas__pp_semana_minimo"), 0))
        )
