"""
Vistas para los endpoints de autenticación.

Define los controladores (views) que gestionan las solicitudes
HTTP de inicio y cierre de sesión, delegando la lógica de
negocio al servicio de autenticación.
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.core.apis.serializers.autenticacion_serializer import (
    LoginSerializer,
)
from apps.core.excepciones import (
    CredencialesInvalidasError,
    UsuarioInactivoError,
)
from apps.core.servicios.autenticacion_servicio import (
    AutenticacionServicio,
)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    """
    Inicio de sesión (público).

    Recibe numero_identificacion y password, valida las credenciales
    y retorna un token de autenticación junto con los datos del usuario.

    POST /api/login/

    Returns:
        200: Token y datos del usuario.
        400: Error de validación de campos.
        401: Credenciales inválidas.
        403: Cuenta inactiva.
    """
    serializer = LoginSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    servicio = AutenticacionServicio()
    try:
        resultado = servicio.iniciar_sesion(
            numero_identificacion=serializer.validated_data[
                "numero_identificacion"
            ],
            password=serializer.validated_data["password"],
        )
        return Response(resultado, status=status.HTTP_200_OK)
    except CredencialesInvalidasError:
        return Response(
            {"error": "Credenciales inválidas"},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    except UsuarioInactivoError:
        return Response(
            {"error": "Cuenta inactiva"},
            status=status.HTTP_403_FORBIDDEN,
        )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """
    Cierre de sesión (requiere autenticación).

    Elimina el token del usuario autenticado, invalidando su sesión.

    POST /api/logout/

    Returns:
        200: Sesión cerrada correctamente.
        401: No autenticado (gestionado por DRF).
    """
    servicio = AutenticacionServicio()
    servicio.cerrar_sesion(request.user)
    return Response(
        {"mensaje": "Sesión cerrada correctamente"},
        status=status.HTTP_200_OK,
    )
