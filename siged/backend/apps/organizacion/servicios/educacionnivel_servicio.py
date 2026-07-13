from apps.organizacion.daos.educacionnivel_dao import EducacionNivelDAO


class EducacionNivelServicio:
    @staticmethod
    def listar():
        return EducacionNivelDAO.listar()
