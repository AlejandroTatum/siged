"""
Servicio de autenticación para SIGED.

Centraliza la lógica de inicio y cierre de sesión,
coordinando las validaciones de credenciales y el manejo de tokens.
"""

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

from apps.core.daos.usuario_dao import UsuarioDAO
from apps.core.excepciones import (
    CredencialesInvalidasError,
    UsuarioInactivoError,
    UsuarioNoEncontradoError,
)

Usuario = get_user_model()


class AutenticacionServicio:
    """
    Servicio que gestiona la lógica de autenticación.

    Métodos:
        iniciar_sesion: Valida credenciales y retorna token + datos del usuario.
        cerrar_sesion: Elimina el token asociado al usuario autenticado.
    """

    def __init__(self):
        self.usuario_dao = UsuarioDAO()

    def iniciar_sesion(self, numero_identificacion, password):
        """
        Valida las credenciales y retorna un token de autenticación.

        Args:
            numero_identificacion: Número de identificación del usuario.
            password: Contraseña en texto plano.

        Returns:
            dict: Contiene el token y los datos del usuario autenticado.

        Raises:
            UsuarioNoEncontradoError: Si no existe el usuario.
            UsuarioInactivoError: Si la cuenta está inactiva.
            CredencialesInvalidasError: Si la contraseña es incorrecta.
        """
        try:
            usuario = self.usuario_dao.obtener_por_identificacion(
                numero_identificacion
            )
        except UsuarioNoEncontradoError:
            raise CredencialesInvalidasError()

        if not usuario.is_active:
            raise UsuarioInactivoError()

        if not check_password(password, usuario.password):
            raise CredencialesInvalidasError()

        token = self.usuario_dao.crear_token(usuario)

        return {
            "token": token.key,
            "usuario": {
                "id": usuario.id,
                "numero_identificacion": usuario.numero_identificacion,
                "first_name": usuario.first_name,
                "last_name": usuario.last_name,
                "is_active": usuario.is_active,
            },
        }

    def cerrar_sesion(self, usuario):
        """
        Cierra la sesión del usuario eliminando su token.

        Args:
            usuario: Instancia del usuario autenticado.
        """
        self.usuario_dao.eliminar_token(usuario)
