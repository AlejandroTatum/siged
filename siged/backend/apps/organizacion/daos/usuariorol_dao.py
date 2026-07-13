from apps.organizacion.models import Rol, UsuarioRol


class UsuarioRolDAO:
    @staticmethod
    def es_autoridad_academica_activa(usuario, institucion_id):
        return UsuarioRol.objects.filter(
            usuario=usuario,
            rol__nombre=Rol.AUTORIDAD_ACADEMICA,
            institucion_id=institucion_id,
            es_activo=True,
        ).exists()

    @staticmethod
    def actualizar(asignacion, datos):
        for campo, valor in datos.items():
            setattr(asignacion, campo, valor)
        asignacion.save()
        return asignacion

    @staticmethod
    def crear(datos):
        return UsuarioRol.objects.create(**datos)

    @staticmethod
    def eliminar(asignacion):
        asignacion.delete()

    @staticmethod
    def listar(institucion=None):
        queryset = UsuarioRol.objects.select_related("usuario", "rol", "institucion")
        return queryset.filter(institucion_id=institucion) if institucion else queryset

    @staticmethod
    def obtener(pk):
        return UsuarioRol.objects.select_related("usuario", "rol", "institucion").get(pk=pk)

    @staticmethod
    def existe_activa(usuario, rol, institucion, excluir_pk=None):
        queryset = UsuarioRol.objects.filter(
            usuario=usuario, rol=rol, institucion=institucion, es_activo=True
        )
        return queryset.exclude(pk=excluir_pk).exists() if excluir_pk else queryset.exists()

    @staticmethod
    def roles_activos(usuario):
        return Rol.objects.filter(asignaciones__usuario=usuario, asignaciones__es_activo=True).distinct()
