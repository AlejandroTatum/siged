"""
Serializers para los endpoints de autenticación.

Define los DTOs de entrada para login y las respuestas
estructuradas de los procesos de autenticación.
"""

from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    """
    Serializer para validar los campos de inicio de sesión.

    Campos requeridos:
        numero_identificacion: Número de identificación del usuario.
        password: Contraseña del usuario.

    Ambos campos son obligatorios. Los mensajes de error
    están en español para consistencia con el dominio.
    """

    numero_identificacion = serializers.CharField(
        required=True,
        error_messages={
            "required": "El número de identificación es obligatorio.",
            "blank": "El número de identificación es obligatorio.",
        },
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        error_messages={
            "required": "La contraseña es obligatoria.",
            "blank": "La contraseña es obligatoria.",
        },
    )
