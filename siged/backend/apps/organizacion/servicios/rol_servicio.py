from apps.organizacion.daos.rol_dao import RolDao


class RolServicio:
    @staticmethod
    def listar():
        return RolDao.listar()
