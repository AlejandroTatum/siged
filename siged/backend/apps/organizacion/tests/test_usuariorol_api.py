from datetime import date

import pytest
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.models import Usuario
from apps.organizacion.models import Institucion, Rol, UsuarioRol


@pytest.mark.django_db
class TestUsuarioRolApi:
    def setup_method(self):
        self.client = APIClient()
        self.admin = Usuario.objects.create_user("admin", password="x")
        self.user = Usuario.objects.create_user("user", password="x", first_name="Ana")
        self.inactive = Usuario.objects.create_user("inactive", password="x", is_active=False)
        self.admin_role = Rol.objects.create(nombre=Rol.ADMINISTRADOR)
        self.authority_role = Rol.objects.create(nombre=Rol.AUTORIDAD_ACADEMICA)
        self.institution = Institucion.objects.create(nombre="Colegio", codigo="C1", ruc="1")
        UsuarioRol.objects.create(usuario=self.admin, rol=self.admin_role)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=self.admin).key}")

    def test_assignment_full_lifecycle_and_contract(self):
        response = self.client.post("/api/usuarioroles/", {"usuario": self.user.id, "rol": self.authority_role.id})
        assert response.status_code == 400
        assert response.json() == {"institucion": ["Este campo es obligatorio para el rol AUTORIDAD_ACADEMICA."]}

        response = self.client.post("/api/usuarioroles/", {"usuario": self.user.id, "rol": self.authority_role.id, "institucion": self.institution.id})
        assert response.status_code == 201
        assignment_id = response.json()["id"]
        assert response.json()["usuario"]["username"] == "user"
        assert response.json()["rol"]["nombre_display"] == "Autoridad académica"
        assert response.json()["es_activo"] is True

        duplicate = self.client.post("/api/usuarioroles/", {"usuario": self.user.id, "rol": self.authority_role.id, "institucion": self.institution.id})
        assert duplicate.status_code == 400
        assert duplicate.json() == {"non_field_errors": ["Ya existe una asignación activa para este usuario, rol e institución."]}

        response = self.client.get(f"/api/usuarioroles/?institucion={self.institution.id}")
        assert response.status_code == 200 and [item["id"] for item in response.json()] == [assignment_id]
        response = self.client.patch(f"/api/usuarioroles/{assignment_id}/estado/", {"es_activo": False}, format="json")
        assert response.status_code == 200 and response.json()["fecha_hasta"] == str(date.today())
        response = self.client.patch(f"/api/usuarioroles/{assignment_id}/estado/", {"es_activo": True}, format="json")
        assert response.status_code == 200 and response.json()["fecha_desde"] == str(date.today()) and response.json()["fecha_hasta"] is None
        assert self.client.delete(f"/api/usuarioroles/{assignment_id}/").status_code == 204
        assert self.client.patch("/api/usuarioroles/999/estado/", {"es_activo": False}, format="json").status_code == 404

    def test_roles_scope_and_user_selector(self):
        UsuarioRol.objects.create(usuario=self.user, rol=self.authority_role, institucion=self.institution)
        user_client = APIClient()
        user_client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=self.user).key}")
        assert user_client.get("/api/usuarioroles/roles/").json() == [{"id": self.authority_role.id, "nombre": "AUTORIDAD_ACADEMICA", "nombre_display": "Autoridad académica"}]
        assert user_client.get("/api/instituciones/usuario/").json()[0]["id"] == self.institution.id
        assert user_client.get("/api/usuarios/").status_code == 403
        active = self.client.get("/api/usuarios/?activo=true")
        assert active.status_code == 200
        assert all(item["is_active"] for item in active.json())
        all_users = self.client.get("/api/usuarios/").json()
        assert any(item["id"] == self.inactive.id for item in all_users)

    def test_administrator_role_catalog_is_minimal_and_restricted(self):
        response = self.client.get("/api/roles/")
        assert response.status_code == 200
        assert response.json() == [
            {"id": self.admin_role.id, "nombre": Rol.ADMINISTRADOR},
            {"id": self.authority_role.id, "nombre": Rol.AUTORIDAD_ACADEMICA},
        ]

        user_client = APIClient()
        user_client.credentials(HTTP_AUTHORIZATION=f"Token {Token.objects.create(user=self.user).key}")
        assert user_client.get("/api/roles/").status_code == 403
        assert APIClient().get("/api/roles/").status_code == 401

    def test_activation_rejects_an_existing_active_combination(self):
        UsuarioRol.objects.create(usuario=self.user, rol=self.authority_role, institucion=self.institution)
        inactive = UsuarioRol.objects.create(usuario=self.user, rol=self.authority_role, institucion=self.institution, es_activo=False)

        response = self.client.patch(f"/api/usuarioroles/{inactive.id}/estado/", {"es_activo": True}, format="json")

        assert response.status_code == 400
        assert response.json() == {"non_field_errors": ["Ya existe una asignación activa para este usuario, rol e institución."]}
        inactive.refresh_from_db()
        assert inactive.es_activo is False

    def test_editing_an_inactive_assignment_does_not_trigger_duplicate_active_check(self):
        UsuarioRol.objects.create(usuario=self.user, rol=self.authority_role, institucion=self.institution)
        typo_user = Usuario.objects.create_user("typo", password="x")
        inactive = UsuarioRol.objects.create(usuario=typo_user, rol=self.authority_role, institucion=self.institution, es_activo=False)

        response = self.client.patch(f"/api/usuarioroles/{inactive.id}/", {"usuario": self.user.id}, format="json")

        assert response.status_code == 200
        inactive.refresh_from_db()
        assert inactive.es_activo is False
        assert inactive.usuario_id == self.user.id

    def test_editing_an_active_assignment_still_rejects_an_existing_active_combination(self):
        UsuarioRol.objects.create(usuario=self.user, rol=self.authority_role, institucion=self.institution)
        other_user = Usuario.objects.create_user("other", password="x")
        active = UsuarioRol.objects.create(usuario=other_user, rol=self.authority_role, institucion=self.institution, es_activo=True)

        response = self.client.patch(f"/api/usuarioroles/{active.id}/", {"usuario": self.user.id}, format="json")

        assert response.status_code == 400
        assert response.json() == {"non_field_errors": ["Ya existe una asignación activa para este usuario, rol e institución."]}
        active.refresh_from_db()
        assert active.usuario_id == other_user.id
