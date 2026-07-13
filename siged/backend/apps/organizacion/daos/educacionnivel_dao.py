from apps.organizacion.models import EducacionNivel


class EducacionNivelDAO:
    @staticmethod
    def listar():
        return EducacionNivel.objects.prefetch_related("subniveles").all()
