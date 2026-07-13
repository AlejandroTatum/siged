from apps.core.models import Usuario


class UsuarioListaDAO:
    @staticmethod
    def listar(activo=None):
        queryset = Usuario.objects.all()
        return queryset.filter(is_active=activo) if activo is not None else queryset
