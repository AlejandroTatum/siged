"""
Data Access Object para la entidad Usuario.

Encapsula el acceso a datos del modelo Usuario,
incluyendo consultas relacionadas con autenticación.
"""

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

from apps.core.excepciones import UsuarioNoEncontradoError

Usuario = get_user_model()


class UsuarioDAO:
    """
    DAO para operaciones de acceso a datos del modelo Usuario.

    Métodos:
        obtener_por_identificacion: Busca un usuario por su número de identificación.
        obtener_token: Obtiene el token de autenticación de un usuario.
        eliminar_token: Elimina el token de autenticación de un usuario.
        crear_token: Crea un nuevo token de autenticación para un usuario.
    """

    @staticmethod
    def obtener_por_identificacion(numero_identificacion):
        """
        Busca un usuario por su número de identificación.

        Args:
            numero_identificacion: Número de identificación del usuario.

        Returns:
            La instancia del Usuario encontrada.

        Raises:
            UsuarioNoEncontradoError: Si no existe un usuario con esa identificación.
        """
        try:
            return Usuario.objects.get(
                numero_identificacion=numero_identificacion
            )
        except Usuario.DoesNotExist:
            raise UsuarioNoEncontradoError(numero_identificacion)

    @staticmethod
    def obtener_token(usuario):
        """
        Obtiene el token de autenticación del usuario.

        Args:
            usuario: Instancia del usuario.

        Returns:
            El token asociado al usuario, o None si no existe.
        """
        try:
            return Token.objects.get(user=usuario)
        except Token.DoesNotExist:
            return None

    @staticmethod
    def eliminar_token(usuario):
        """
        Elimina el token de autenticación del usuario.

        Args:
            usuario: Instancia del usuario.
        """
        Token.objects.filter(user=usuario).delete()

    @staticmethod
    def crear_token(usuario):
        """
        Crea un nuevo token de autenticación para el usuario.
        Si ya existe un token, lo elimina antes de crear uno nuevo.

        Args:
            usuario: Instancia del usuario.

        Returns:
            El nuevo token creado.
        """
        Token.objects.filter(user=usuario).delete()
        return Token.objects.create(user=usuario)
