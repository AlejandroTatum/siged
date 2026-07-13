from apps.organizacion.models import PlanEstudio


class PlanEstudioDAO:
    @staticmethod
    def actualizar(plan, datos):
        for campo, valor in datos.items():
            setattr(plan, campo, valor)
        plan.save()
        return plan

    @staticmethod
    def crear(datos):
        return PlanEstudio.objects.create(**datos)

    @staticmethod
    def eliminar(plan):
        plan.delete()

    @staticmethod
    def existe_activo(institucion_id, excluir_pk=None):
        queryset = PlanEstudio.objects.filter(institucion_id=institucion_id, es_activo=True)
        return queryset.exclude(pk=excluir_pk).exists() if excluir_pk else queryset.exists()

    @staticmethod
    def existe_nombre(institucion_id, nombre, excluir_pk=None):
        queryset = PlanEstudio.objects.filter(institucion_id=institucion_id, nombre=nombre)
        return queryset.exclude(pk=excluir_pk).exists() if excluir_pk else queryset.exists()

    @staticmethod
    def listar(institucion_id, nombre="", ordering="nombre"):
        return PlanEstudio.objects.filter(
            institucion_id=institucion_id, nombre__icontains=nombre
        ).select_related("institucion").order_by(ordering)

    @staticmethod
    def tiene_grados(plan):
        return plan.grados_escolares.exists()

    @staticmethod
    def todos():
        return PlanEstudio.objects.select_related("institucion").all()
