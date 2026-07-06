"""
Excepciones personalizadas para la aplicación Core.

Define las excepciones de dominio utilizadas en servicios
y DAOs para manejar errores de negocio de forma consistente.
"""


class UsuarioNoEncontradoError(Exception):
    """Se lanza cuando no se encuentra un usuario con la identificación dada."""

    def __init__(self, numero_identificacion=None):
        mensaje = (
            f"No se encontró un usuario con identificación "
            f"'{numero_identificacion}'"
            if numero_identificacion
            else "No se encontró el usuario especificado"
        )
        super().__init__(mensaje)


class UsuarioInactivoError(Exception):
    """Se lanza cuando se intenta autenticar con una cuenta inactiva."""

    def __init__(self):
        super().__init__(
            "La cuenta del usuario se encuentra inactiva. "
            "Contacte al administrador del sistema."
        )


class CredencialesInvalidasError(Exception):
    """Se lanza cuando las credenciales proporcionadas son inválidas."""

    def __init__(self):
        super().__init__("Credenciales inválidas")
