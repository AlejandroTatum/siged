from apps.organizacion.models import Asignatura


class AsignaturaDAO:
    @staticmethod
    def actualizar(asignatura, datos):
        for campo, valor in datos.items():
            setattr(asignatura, campo, valor)
        asignatura.save()
        return asignatura

    @staticmethod
    def crear(datos):
        return Asignatura.objects.create(**datos)

    @staticmethod
    def eliminar(asignatura):
        asignatura.delete()

    @staticmethod
    def existe_nombre(grado_escolar_id, nombre, excluir_pk=None):
        queryset = Asignatura.objects.filter(
            grado_escolar_id=grado_escolar_id, nombre=nombre
        )
        return queryset.exclude(pk=excluir_pk).exists() if excluir_pk else queryset.exists()

    @staticmethod
    def listar(grado_escolar_id):
        return AsignaturaDAO.todos().filter(grado_escolar_id=grado_escolar_id)

    @staticmethod
    def todos():
        return Asignatura.objects.select_related(
            "grado_escolar__plan_estudio__institucion"
        ).all()
