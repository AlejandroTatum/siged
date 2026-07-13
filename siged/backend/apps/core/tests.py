"""
Pruebas para la aplicación Core — autenticación.

Cubre:
- Tests unitarios: validación de serializer, servicio de autenticación.
- Tests de integración: vista → servicio → DAO.
- Tests de autorización: acceso público/autenticado a endpoints.
"""

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.apis.serializers.autenticacion_serializer import (
    LoginSerializer,
)
from apps.core.daos.usuario_dao import UsuarioDAO
from apps.core.excepciones import (
    CredencialesInvalidasError,
    UsuarioInactivoError,
    UsuarioNoEncontradoError,
)
from apps.core.management.commands.seed_demo import (
    DEMO_INSTITUTIONS,
    DEMO_PASSWORD,
    DEMO_USERS,
)
from apps.core.servicios.autenticacion_servicio import (
    AutenticacionServicio,
)
from apps.organizacion.models import Institucion, Rol, UsuarioRol

Usuario = get_user_model()


# =============================================================================
# Tests unitarios
# =============================================================================


class UsuarioManagerTestCase(TestCase):
    """Pruebas unitarias para UsuarioManager."""

    def test_create_superuser_configura_credenciales_admin(self):
        usuario = Usuario.objects.create_superuser(
            numero_identificacion="000000001",
            password="admin123",
        )

        self.assertTrue(usuario.is_active)
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertTrue(usuario.check_password("admin123"))

    def test_create_superuser_rechaza_staff_falso(self):
        with self.assertRaisesMessage(
            ValueError,
            "Superuser must have is_staff=True.",
        ):
            Usuario.objects.create_superuser(
                numero_identificacion="000000001",
                password="admin123",
                is_staff=False,
            )


class SeedSuperuserCommandTestCase(TestCase):
    """Pruebas del comando de configuración local del administrador."""

    @override_settings(DEBUG=True)
    def test_crea_administrador_documentado(self):
        call_command("seed_superuser")

        usuario = Usuario.objects.get(numero_identificacion="000000001")
        self.assertEqual(usuario.email, "admin@example.com")
        self.assertEqual(usuario.first_name, "Administrador")
        self.assertEqual(usuario.last_name, "Sistema")
        self.assertTrue(usuario.is_active)
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertTrue(usuario.check_password("admin123"))

    @override_settings(DEBUG=True)
    def test_administrador_sembrado_y_restablecido_autentica(self):
        call_command("seed_superuser")

        self.assertTrue(
            self.client.login(
                numero_identificacion="000000001",
                password="admin123",
            )
        )
        self.client.logout()

        usuario = Usuario.objects.get(numero_identificacion="000000001")
        usuario.set_password("otra-clave")
        usuario.save()

        call_command("seed_superuser", "--reset")

        self.assertTrue(
            self.client.login(
                numero_identificacion="000000001",
                password="admin123",
            )
        )

    @override_settings(DEBUG=True)
    def test_administrador_existente_no_se_sobrescribe_sin_reset(self):
        usuario = Usuario.objects.create_user(
            numero_identificacion="000000001",
            password="otra-clave",
            email="old@example.com",
        )

        call_command("seed_superuser")

        usuario.refresh_from_db()
        self.assertEqual(usuario.email, "old@example.com")
        self.assertTrue(usuario.check_password("otra-clave"))

    @override_settings(DEBUG=True)
    def test_reset_restaura_administrador_documentado(self):
        usuario = Usuario.objects.create_user(
            numero_identificacion="000000001",
            password="otra-clave",
            email="old@example.com",
            first_name="Otro",
            last_name="Usuario",
            is_active=False,
            is_staff=False,
        )

        call_command("seed_superuser", "--reset")

        usuario.refresh_from_db()
        self.assertEqual(usuario.email, "admin@example.com")
        self.assertEqual(usuario.first_name, "Administrador")
        self.assertEqual(usuario.last_name, "Sistema")
        self.assertTrue(usuario.is_active)
        self.assertTrue(usuario.is_staff)
        self.assertTrue(usuario.is_superuser)
        self.assertTrue(usuario.check_password("admin123"))

    @override_settings(DEBUG=False)
    def test_rechaza_credenciales_conocidas_fuera_de_desarrollo(self):
        with self.assertRaises(CommandError):
            call_command("seed_superuser")


class SeedDemoCommandTestCase(TestCase):
    @override_settings(DEBUG=False)
    def test_rechaza_datos_demo_fuera_de_desarrollo(self):
        with self.assertRaises(CommandError):
            call_command("seed_demo")

    @override_settings(DEBUG=True)
    def test_primera_ejecucion_crea_demo_y_segunda_es_idempotente(self):
        call_command("seed_demo")

        self.assertEqual(
            Usuario.objects.filter(
                numero_identificacion__in=[row[0] for row in DEMO_USERS]
            ).count(),
            4,
        )
        self.assertEqual(
            Institucion.objects.filter(
                ruc__in=[row[2] for row in DEMO_INSTITUTIONS]
            ).count(),
            3,
        )
        self.assertEqual(UsuarioRol.objects.count(), 4)
        codes = list(
            Institucion.objects.order_by("codigo").values_list("codigo", flat=True)
        )
        self.assertEqual(codes, sorted(row[0] for row in DEMO_INSTITUTIONS))

        call_command("seed_demo")

        self.assertEqual(Usuario.objects.count(), 4)
        self.assertEqual(Institucion.objects.count(), 3)
        self.assertEqual(UsuarioRol.objects.count(), 4)
        self.assertEqual(
            list(
                Institucion.objects.order_by("codigo").values_list(
                    "codigo", flat=True
                )
            ),
            codes,
        )

    @override_settings(DEBUG=True)
    def test_rechaza_colision_de_ruc_con_codigo_o_nombre_distinto_antes_de_asignar_roles(self):
        identification, first_name, last_name, _ = DEMO_USERS[0]
        user = Usuario.objects.create_user(
            numero_identificacion=identification,
            password=DEMO_PASSWORD,
            first_name=first_name,
            last_name=last_name,
        )
        codigo, name, ruc = DEMO_INSTITUTIONS[0]
        institution = Institucion.objects.create(nombre=name, codigo="INST900", ruc=ruc)

        with self.assertRaisesMessage(
            CommandError,
            f"El RUC demo {ruc} pertenece a una institución existente distinta.",
        ):
            call_command("seed_demo")

        self.assertEqual(
            Usuario.objects.get(numero_identificacion=identification).pk,
            user.pk,
        )
        self.assertEqual(Institucion.objects.get(ruc=ruc).pk, institution.pk)
        self.assertEqual(Institucion.objects.get(ruc=ruc).codigo, "INST900")
        self.assertFalse(UsuarioRol.objects.filter(usuario=user).exists())
        self.assertFalse(Rol.objects.exists())

    @override_settings(DEBUG=True)
    def test_rechaza_colision_de_ruc_con_nombre_distinto_antes_de_asignar_roles(self):
        identification, first_name, last_name, _ = DEMO_USERS[0]
        user = Usuario.objects.create_user(
            numero_identificacion=identification,
            password=DEMO_PASSWORD,
            first_name=first_name,
            last_name=last_name,
        )
        codigo, _, ruc = DEMO_INSTITUTIONS[0]
        institution = Institucion.objects.create(
            nombre="Nombre ajeno", codigo=codigo, ruc=ruc
        )

        with self.assertRaisesMessage(
            CommandError,
            f"El RUC demo {ruc} pertenece a una institución existente distinta.",
        ):
            call_command("seed_demo")

        self.assertEqual(Institucion.objects.get(ruc=ruc).pk, institution.pk)
        self.assertFalse(UsuarioRol.objects.filter(usuario=user).exists())
        self.assertFalse(Rol.objects.exists())

    @override_settings(DEBUG=True)
    def test_no_otorga_administracion_a_cuenta_preexistente_arbitraria(self):
        identification = DEMO_USERS[0][0]
        user = Usuario.objects.create_user(
            numero_identificacion=identification,
            password="private",
        )

        with self.assertRaises(CommandError):
            call_command("seed_demo")

        self.assertFalse(UsuarioRol.objects.filter(usuario=user).exists())
        self.assertEqual(Usuario.objects.count(), 1)


class LoginSerializerTestCase(TestCase):
    """Pruebas unitarias para LoginSerializer."""

    def test_campos_obligatorios_son_requeridos(self):
        """RF-001: numero_identificacion y password son obligatorios."""
        serializer = LoginSerializer(data={})
        self.assertFalse(serializer.is_valid())
        self.assertIn("numero_identificacion", serializer.errors)
        self.assertIn("password", serializer.errors)

    def test_numero_identificacion_vacio_es_invalido(self):
        """RF-001: numero_identificacion vacío muestra error."""
        serializer = LoginSerializer(data={
            "numero_identificacion": "",
            "password": "secreta",
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("numero_identificacion", serializer.errors)

    def test_password_vacio_es_invalido(self):
        """RF-001: password vacío muestra error."""
        serializer = LoginSerializer(data={
            "numero_identificacion": "1234567890",
            "password": "",
        })
        self.assertFalse(serializer.is_valid())
        self.assertIn("password", serializer.errors)

    def test_datos_validos_pasan_serializer(self):
        """Datos completos y válidos pasan la validación."""
        serializer = LoginSerializer(data={
            "numero_identificacion": "1234567890",
            "password": "mi_contraseña",
        })
        self.assertTrue(serializer.is_valid())

    def test_mensajes_error_en_espanol(self):
        """Los mensajes de error del serializer están en español."""
        serializer = LoginSerializer(data={})
        serializer.is_valid()
        self.assertEqual(
            serializer.errors["numero_identificacion"][0],
            "El número de identificación es obligatorio.",
        )
        self.assertEqual(
            serializer.errors["password"][0],
            "La contraseña es obligatoria.",
        )


class UsuarioDAOTestCase(TestCase):
    """Pruebas unitarias para UsuarioDAO."""

    def setUp(self):
        self.usuario = Usuario.objects.create_user(
            numero_identificacion="12345678",
            password="pass123",
            first_name="Juan",
            last_name="Pérez",
            is_active=True,
        )

    def test_obtener_por_identificacion_exitoso(self):
        """DAO encuentra usuario por identificación."""
        usuario = UsuarioDAO.obtener_por_identificacion("12345678")
        self.assertEqual(usuario, self.usuario)

    def test_obtener_por_identificacion_no_encontrado(self):
        """DAO lanza excepción si no encuentra el usuario."""
        with self.assertRaises(UsuarioNoEncontradoError):
            UsuarioDAO.obtener_por_identificacion("NO_EXISTE")

    def test_crear_token_retorna_token_valido(self):
        """DAO crea un token y lo retorna."""
        token = UsuarioDAO.crear_token(self.usuario)
        self.assertIsNotNone(token)
        self.assertEqual(token.user, self.usuario)

    def test_crear_token_renueva_si_existe(self):
        """DAO elimina token anterior al crear uno nuevo."""
        token1 = UsuarioDAO.crear_token(self.usuario)
        token2 = UsuarioDAO.crear_token(self.usuario)
        self.assertNotEqual(token1.key, token2.key)

    def test_eliminar_token_remueve_token(self):
        """DAO elimina el token del usuario."""
        UsuarioDAO.crear_token(self.usuario)
        UsuarioDAO.eliminar_token(self.usuario)
        token = UsuarioDAO.obtener_token(self.usuario)
        self.assertIsNone(token)

    def test_obtener_token_retorna_none_sin_token(self):
        """DAO retorna None si el usuario no tiene token."""
        token = UsuarioDAO.obtener_token(self.usuario)
        self.assertIsNone(token)


class AutenticacionServicioTestCase(TestCase):
    """Pruebas unitarias para AutenticacionServicio."""

    def setUp(self):
        self.servicio = AutenticacionServicio()
        self.usuario = Usuario.objects.create_user(
            numero_identificacion="87654321",
            password="pass_segura",
            first_name="María",
            last_name="García",
            is_active=True,
        )

    def test_iniciar_sesion_exitoso_retorna_token_y_datos(self):
        """RF-002: Login exitoso retorna token y datos del usuario."""
        resultado = self.servicio.iniciar_sesion(
            "87654321", "pass_segura"
        )
        self.assertIn("token", resultado)
        self.assertIn("usuario", resultado)
        self.assertEqual(
            resultado["usuario"]["numero_identificacion"], "87654321"
        )
        self.assertEqual(resultado["usuario"]["first_name"], "María")
        self.assertEqual(resultado["usuario"]["last_name"], "García")
        self.assertTrue(resultado["usuario"]["is_active"])

    def test_iniciar_sesion_credenciales_invalidas(self):
        """RF-003: Login con credenciales inválidas lanza error."""
        with self.assertRaises(CredencialesInvalidasError):
            self.servicio.iniciar_sesion("87654321", "wrong_password")

    def test_iniciar_sesion_identificacion_inexistente(self):
        """RF-003: Login con identificación inexistente lanza error."""
        with self.assertRaises(CredencialesInvalidasError):
            self.servicio.iniciar_sesion("NO_EXISTE", "pass_segura")

    def test_iniciar_sesion_usuario_inactivo(self):
        """RF-004: Login con cuenta inactiva lanza error específico."""
        self.usuario.is_active = False
        self.usuario.save()
        with self.assertRaises(UsuarioInactivoError):
            self.servicio.iniciar_sesion("87654321", "pass_segura")

    def test_cerrar_sesion_elimina_token(self):
        """RF-005: Cerrar sesión elimina el token."""
        self.servicio.iniciar_sesion("87654321", "pass_segura")
        self.servicio.cerrar_sesion(self.usuario)
        token = UsuarioDAO.obtener_token(self.usuario)
        self.assertIsNone(token)


# =============================================================================
# Tests de integración
# =============================================================================

class LoginViewIntegrationTestCase(TestCase):
    """Pruebas de integración para el endpoint de login."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/login/"
        self.usuario = Usuario.objects.create_user(
            numero_identificacion="99999999",
            password="password_valido",
            first_name="Test",
            last_name="Usuario",
            is_active=True,
        )

    def test_login_exitoso_retorna_token(self):
        """RF-002: Login exitoso retorna 200 con token y datos."""
        response = self.client.post(self.url, {
            "numero_identificacion": "99999999",
            "password": "password_valido",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
        self.assertIn("usuario", response.data)
        self.assertEqual(
            response.data["usuario"]["numero_identificacion"],
            "99999999",
        )

    def test_login_credenciales_invalidas_retorna_401(self):
        """RF-003: Credenciales inválidas retorna 401."""
        response = self.client.post(self.url, {
            "numero_identificacion": "99999999",
            "password": "incorrecto",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "Credenciales inválidas")

    def test_login_campos_vacios_retorna_400(self):
        """RF-001: Campos vacíos retornan 400 con errores."""
        response = self.client.post(self.url, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("numero_identificacion", response.data)
        self.assertIn("password", response.data)

    def test_login_usuario_inactivo_retorna_403(self):
        """RF-004: Usuario inactivo retorna 403."""
        self.usuario.is_active = False
        self.usuario.save()
        response = self.client.post(self.url, {
            "numero_identificacion": "99999999",
            "password": "password_valido",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data["error"], "Cuenta inactiva")


class LogoutViewIntegrationTestCase(TestCase):
    """Pruebas de integración para el endpoint de logout."""

    def setUp(self):
        self.client = APIClient()
        self.url = "/api/logout/"
        self.usuario = Usuario.objects.create_user(
            numero_identificacion="55555555",
            password="clave_secreta",
            first_name="Logout",
            last_name="Test",
            is_active=True,
        )

    def test_logout_sin_autenticacion_retorna_401(self):
        """RF-006: Logout sin token retorna 401."""
        response = self.client.post(self.url, format="json")
        self.assertEqual(
            response.status_code, status.HTTP_401_UNAUTHORIZED
        )

    def test_logout_con_autenticacion_retorna_200(self):
        """RF-005: Logout autenticado retorna 200."""
        token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        response = self.client.post(self.url, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(
            response.data["mensaje"], "Sesión cerrada correctamente"
        )

    def test_logout_invalida_token_existente(self):
        """RF-005: Logout elimina el token de la BD."""
        token = Token.objects.create(user=self.usuario)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
        self.client.post(self.url, format="json")
        # El token ya no debe existir
        token_existe = Token.objects.filter(
            user=self.usuario
        ).exists()
        self.assertFalse(token_existe)


# =============================================================================
# Tests de autorización
# =============================================================================

class AutorizacionEndpointTestCase(TestCase):
    """Pruebas de autorización para los endpoints de autenticación."""

    def setUp(self):
        self.client = APIClient()
        self.usuario = Usuario.objects.create_user(
            numero_identificacion="11111111",
            password="pass_autorizacion",
            is_active=True,
        )
        self.token = Token.objects.create(user=self.usuario)

    def test_login_publico_sin_autenticacion(self):
        """El endpoint login es público (sin autenticación previa)."""
        response = self.client.post("/api/login/", {
            "numero_identificacion": "11111111",
            "password": "pass_autorizacion",
        }, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_sin_token_retorna_401(self):
        """Logout sin token retorna 401."""
        response = self.client.post("/api/logout/", format="json")
        self.assertEqual(
            response.status_code, status.HTTP_401_UNAUTHORIZED
        )

    def test_logout_con_token_retorna_200(self):
        """Logout con token válido retorna 200."""
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Token {self.token.key}"
        )
        response = self.client.post("/api/logout/", format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
