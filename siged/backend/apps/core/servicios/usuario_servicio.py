from apps.core.daos.usuario_lista_dao import UsuarioListaDAO


class UsuarioServicio:
    @staticmethod
    def listar(activo=None):
        return UsuarioListaDAO.listar(activo)
