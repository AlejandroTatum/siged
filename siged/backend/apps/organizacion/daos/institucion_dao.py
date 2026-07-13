from django.db.models import Prefetch

from apps.organizacion.models import Institucion, Rol, UsuarioRol


class InstitucionDAO:
    @staticmethod
    def actualizar(institucion, datos):
        for campo, valor in datos.items():
            setattr(institucion, campo, valor)
        institucion.save()
        return institucion

    @staticmethod
    def autoridades_activas(institucion):
        return institucion.asignaciones.filter(
            es_activo=True, rol__nombre=Rol.AUTORIDAD_ACADEMICA
        ).select_related("usuario", "rol")

    @staticmethod
    def crear(datos):
        return Institucion.objects.create(**datos)

    @staticmethod
    def eliminar(institucion):
        institucion.delete()

    @staticmethod
    def listar(nombre="", ordering="nombre"):
        active = UsuarioRol.objects.filter(
            es_activo=True, rol__nombre=Rol.AUTORIDAD_ACADEMICA
        ).select_related("usuario", "rol")
        return Institucion.objects.filter(nombre__icontains=nombre).prefetch_related(
            Prefetch("asignaciones", queryset=active, to_attr="autoridades_academicas_cache")
        ).order_by(ordering)

    @staticmethod
    def obtener_bloqueada(pk):
        return Institucion.objects.select_for_update().get(pk=pk)

    @staticmethod
    def listar_por_usuario(usuario):
        return Institucion.objects.filter(
            asignaciones__usuario=usuario,
            asignaciones__es_activo=True,
            asignaciones__rol__nombre=Rol.AUTORIDAD_ACADEMICA,
        ).distinct()

    @staticmethod
    def tiene_asignaciones_activas(institucion):
        return institucion.asignaciones.filter(
            es_activo=True, rol__nombre=Rol.AUTORIDAD_ACADEMICA
        ).exists()
