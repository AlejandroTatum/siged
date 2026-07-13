from apps.organizacion.daos.usuariorol_dao import UsuarioRolDAO


class UsuarioRolServicio:
    MENSAJE_DUPLICADO = "Ya existe una asignación activa para este usuario, rol e institución."

    @staticmethod
    def actualizar(asignacion, datos):
        return UsuarioRolDAO.actualizar(asignacion, datos)

    @staticmethod
    def cambiar_estado(asignacion, es_activo):
        if es_activo and UsuarioRolDAO.existe_activa(
            asignacion.usuario, asignacion.rol, asignacion.institucion, asignacion.pk
        ):
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"non_field_errors": [UsuarioRolServicio.MENSAJE_DUPLICADO]})
        asignacion.activar() if es_activo else asignacion.desactivar()
        return asignacion

    @staticmethod
    def crear(datos):
        return UsuarioRolDAO.crear(datos)

    @staticmethod
    def eliminar(asignacion):
        UsuarioRolDAO.eliminar(asignacion)

    @staticmethod
    def listar(institucion=None):
        return UsuarioRolDAO.listar(institucion)

    @staticmethod
    def roles_activos(usuario):
        return UsuarioRolDAO.roles_activos(usuario)
