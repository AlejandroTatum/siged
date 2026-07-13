from apps.organizacion.models import Rol


class RolDao:
    @staticmethod
    def listar():
        return Rol.objects.all().order_by("nombre")
