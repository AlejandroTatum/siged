import pytest
from django.db import IntegrityError
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.models import Usuario
from apps.organizacion.apis.serializers.institucion_serializer import InstitucionSerializer
from apps.organizacion.models import Institucion, Rol, UsuarioRol
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio


def authenticated_client(user):
    client = APIClient()
    token, _ = Token.objects.get_or_create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def roles(db):
    return {
        name: Rol.objects.create(nombre=name)
        for name in (Rol.ADMINISTRADOR, Rol.AUTORIDAD_ACADEMICA)
    }


@pytest.fixture
def admin_client(roles):
    user = Usuario.objects.create_user(numero_identificacion="100", password="secret")
    UsuarioRol.objects.create(usuario=user, rol=roles[Rol.ADMINISTRADOR])
    return authenticated_client(user)


@pytest.mark.django_db
def test_list_returns_exact_nested_authority_contract_and_timestamps(admin_client, roles):
    institution = Institucion.objects.create(nombre="Alpha School", codigo="A", ruc="1")
    authority = Usuario.objects.create_user(
        numero_identificacion="201", first_name="Ana", last_name="Paz"
    )
    assignment = UsuarioRol.objects.create(
        usuario=authority, rol=roles[Rol.AUTORIDAD_ACADEMICA], institucion=institution
    )
    response = admin_client.get("/api/instituciones/?nombre=alpha&ordering=-nombre&page_size=1")
    assert response.status_code == 200
    row = response.data["results"][0]
    assert set(row) == {
        "id", "nombre", "codigo", "ruc", "fecha_creacion", "fecha_actualizacion",
        "autoridades_academicas",
    }
    assert row["autoridades_academicas"] == [{
        "id": assignment.id,
        "usuario": {"id": authority.id, "username": "201", "first_name": "Ana", "last_name": "Paz"},
        "rol": {"id": roles[Rol.AUTORIDAD_ACADEMICA].id, "nombre": Rol.AUTORIDAD_ACADEMICA, "nombre_display": "Autoridad académica"},
        "es_activo": True,
        "fecha_desde": assignment.fecha_desde.isoformat(),
    }]


@pytest.mark.django_db
def test_detail_allows_only_admin_or_actively_scoped_authority(admin_client, roles):
    institution = Institucion.objects.create(nombre="Central", codigo="C", ruc="2")
    authority = Usuario.objects.create_user(numero_identificacion="202")
    assignment = UsuarioRol.objects.create(
        usuario=authority, rol=roles[Rol.AUTORIDAD_ACADEMICA], institucion=institution
    )
    assert authenticated_client(authority).get(f"/api/instituciones/{institution.id}/").status_code == 200
    assignment.desactivar()
    assert authenticated_client(authority).get(f"/api/instituciones/{institution.id}/").status_code == 403
    assert admin_client.get(f"/api/instituciones/{institution.id}/").status_code == 200


@pytest.mark.django_db
def test_delete_conflict_has_exact_body_and_inactive_assignments_are_not_preserved(admin_client, roles):
    institution = Institucion.objects.create(nombre="Central", codigo="C", ruc="2")
    authority = Usuario.objects.create_user(numero_identificacion="203")
    assignment = UsuarioRol.objects.create(
        usuario=authority, rol=roles[Rol.AUTORIDAD_ACADEMICA], institucion=institution
    )
    url = f"/api/instituciones/{institution.id}/"
    response = admin_client.delete(url)
    assert response.status_code == 409
    assert response.data == {"error": "No se puede eliminar la institución porque tiene autoridades académicas activas."}
    assignment.desactivar()
    assert admin_client.delete(url).status_code == 204
    assert not UsuarioRol.objects.filter(pk=assignment.pk).exists()


@pytest.mark.django_db
def test_active_non_academic_assignment_does_not_block_deletion(admin_client, roles):
    institution = Institucion.objects.create(nombre="Central", codigo="C", ruc="2")
    user = Usuario.objects.create_user(numero_identificacion="204")
    UsuarioRol.objects.create(
        usuario=user, rol=roles[Rol.ADMINISTRADOR], institucion=institution, es_activo=True
    )
    assert admin_client.delete(f"/api/instituciones/{institution.id}/").status_code == 204


@pytest.mark.django_db
def test_create_patch_validation_and_exact_basic_payload(admin_client):
    created = admin_client.post(
        "/api/instituciones/", {"codigo": "CENTRAL-01", "nombre": " Central ", "ruc": "123"}
    )
    assert created.status_code == 201
    assert set(created.data) == {"id", "nombre", "codigo", "ruc", "fecha_creacion", "fecha_actualizacion"}
    assert created.data["nombre"] == "Central"
    assert created.data["codigo"] == "CENTRAL-01"
    detail = f"/api/instituciones/{created.data['id']}/"
    updated = admin_client.patch(detail, {"codigo": "CENTRAL-02", "nombre": "Central"})
    assert updated.status_code == 200
    assert updated.data["codigo"] == "CENTRAL-02"
    blank = admin_client.post("/api/instituciones/", {"codigo": "Y", "nombre": "   ", "ruc": "Y"})
    assert blank.status_code == 400 and "nombre" in blank.data


@pytest.mark.django_db
def test_create_rejects_whitespace_only_codigo_and_ruc_and_trims_valid_values(admin_client):
    blank_codigo = admin_client.post(
        "/api/instituciones/", {"codigo": "   ", "nombre": "Whitespace Codigo", "ruc": "555"}
    )
    assert blank_codigo.status_code == 400
    assert blank_codigo.data == {"codigo": ["Este campo no puede estar en blanco."]}

    blank_ruc = admin_client.post(
        "/api/instituciones/", {"codigo": "WS-01", "nombre": "Whitespace Ruc", "ruc": "   "}
    )
    assert blank_ruc.status_code == 400
    assert blank_ruc.data == {"ruc": ["Este campo no puede estar en blanco."]}

    created = admin_client.post(
        "/api/instituciones/", {"codigo": " WS-02 ", "nombre": "Trimmed Fields", "ruc": " 556 "}
    )
    assert created.status_code == 201
    assert created.data["codigo"] == "WS-02"
    assert created.data["ruc"] == "556"


@pytest.mark.django_db
def test_patch_requires_an_explicit_institution_code_and_keeps_code_present_updates(admin_client):
    institution = Institucion.objects.create(nombre="Central", codigo="C1", ruc="1")
    detail = f"/api/instituciones/{institution.id}/"

    missing_code = admin_client.patch(detail, {"nombre": "Central Updated"})
    assert missing_code.status_code == 400
    assert missing_code.data == {"codigo": ["Este campo es obligatorio."]}
    institution.refresh_from_db()
    assert institution.nombre == "Central"

    with_code = admin_client.patch(
        detail, {"codigo": "C2", "nombre": "Central Updated"}
    )
    assert with_code.status_code == 200
    assert with_code.data["codigo"] == "C2"
    assert with_code.data["nombre"] == "Central Updated"


@pytest.mark.django_db
def test_service_delegates_delete_queries_and_deletion_to_dao(admin_client, monkeypatch):
    institution = Institucion.objects.create(nombre="Central", codigo="C", ruc="2")
    calls = []
    from apps.organizacion.daos.institucion_dao import InstitucionDAO
    monkeypatch.setattr(InstitucionDAO, "tiene_asignaciones_activas", lambda obj: calls.append("check") or False)
    monkeypatch.setattr(InstitucionDAO, "eliminar", lambda obj: calls.append("delete"))
    assert admin_client.delete(f"/api/instituciones/{institution.id}/").status_code == 204
    assert calls == ["check", "delete"]


@pytest.mark.django_db
def test_documented_authentication_authorization_and_not_found_contracts(roles):
    unauthenticated = APIClient()
    assert unauthenticated.get("/api/instituciones/").status_code == 401
    assert unauthenticated.get("/api/instituciones/").data == {
        "detail": "Las credenciales de autenticación no se proporcionaron."
    }
    user = Usuario.objects.create_user(numero_identificacion="300")
    forbidden = authenticated_client(user)
    assert forbidden.get("/api/instituciones/").status_code == 403
    assert forbidden.get("/api/instituciones/").data == {
        "detail": "No tiene permisos para realizar esta acción."
    }
    admin = Usuario.objects.create_user(numero_identificacion="301")
    UsuarioRol.objects.create(usuario=admin, rol=roles[Rol.ADMINISTRADOR])
    admin_client = authenticated_client(admin)
    assert admin_client.get("/api/instituciones/999999/").status_code == 404
    assert admin_client.get("/api/instituciones/999999/").data == {"detail": "No encontrado."}
    assert admin_client.patch("/api/instituciones/999999/", {"nombre": "X"}).status_code == 404
    assert admin_client.delete("/api/instituciones/999999/").status_code == 404


@pytest.mark.django_db
def test_required_and_duplicate_field_error_bodies(admin_client):
    required = admin_client.post("/api/instituciones/", {})
    assert required.status_code == 400
    assert required.data == {
        "codigo": ["Este campo es obligatorio."],
        "nombre": ["Este campo es obligatorio."],
        "ruc": ["Este campo es obligatorio."],
    }
    Institucion.objects.create(nombre="Central", codigo="C01", ruc="123")
    duplicate = admin_client.post(
        "/api/instituciones/", {"codigo": "C01", "nombre": "Central", "ruc": "123"}
    )
    assert duplicate.status_code == 400
    assert duplicate.data == {
        "codigo": ["institución con este código ya existe."],
        "nombre": ["institución con este nombre ya existe."],
        "ruc": ["institución con este ruc ya existe."],
    }


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("service_method", "request_method", "url", "payload", "database_error", "expected"),
    [
        (
            "crear",
            "post",
            "/api/instituciones/",
            {"codigo": "RACE-CODE", "nombre": "Race create", "ruc": "900"},
            "UNIQUE constraint failed: organizacion_institucion.codigo",
            {"codigo": ["institución con este código ya existe."]},
        ),
        (
            "actualizar",
            "patch",
            None,
            {"codigo": "RACE-UPDATE", "nombre": "Race update", "ruc": "901"},
            "UNIQUE constraint failed: organizacion_institucion.ruc",
            {"ruc": ["institución con este ruc ya existe."]},
        ),
    ],
)
def test_unique_constraint_races_return_deterministic_field_errors(
    admin_client,
    monkeypatch,
    service_method,
    request_method,
    url,
    payload,
    database_error,
    expected,
):
    if service_method == "actualizar":
        institution = Institucion.objects.create(nombre="Race target", codigo="TARGET", ruc="899")
        url = f"/api/instituciones/{institution.id}/"

    def raise_race(*args):
        raise IntegrityError(database_error)

    monkeypatch.setattr(InstitucionServicio, service_method, raise_race)
    response = getattr(admin_client, request_method)(url, payload)

    assert response.status_code == 400
    assert response.data == expected


@pytest.mark.django_db
def test_unrelated_integrity_errors_are_not_converted_to_validation_errors(monkeypatch):
    serializer = InstitucionSerializer(
        data={"codigo": "OTHER", "nombre": "Other", "ruc": "902"}
    )
    assert serializer.is_valid()

    def raise_unrelated(*args):
        raise IntegrityError("FOREIGN KEY constraint failed")

    monkeypatch.setattr(InstitucionServicio, "crear", raise_unrelated)
    with pytest.raises(IntegrityError, match="FOREIGN KEY constraint failed"):
        serializer.save()


@pytest.mark.django_db
def test_manual_code_is_editable_unique_and_reusable_by_its_current_record(admin_client):
    first = admin_client.post(
        "/api/instituciones/", {"nombre": "First", "codigo": "MANUAL-01", "ruc": "101"}
    )
    assert first.status_code == 201
    assert first.data["codigo"] == "MANUAL-01"
    detail = f"/api/instituciones/{first.data['id']}/"
    updated = admin_client.patch(detail, {"nombre": "First Updated", "codigo": "MANUAL-02"})
    assert updated.status_code == 200
    assert updated.data["codigo"] == "MANUAL-02"
    same_record = admin_client.patch(detail, {"codigo": "MANUAL-02"})
    assert same_record.status_code == 200
    duplicate = admin_client.post(
        "/api/instituciones/", {"nombre": "Second", "codigo": "MANUAL-02", "ruc": "102"}
    )
    assert duplicate.status_code == 400
    assert duplicate.data == {"codigo": ["institución con este código ya existe."]}


@pytest.mark.django_db
def test_mis_instituciones_returns_only_active_academic_authority_assignments(roles):
    authority_institution = Institucion.objects.create(nombre="Authority", codigo="AUTH", ruc="401")
    inactive_institution = Institucion.objects.create(nombre="Inactive", codigo="INACTIVE", ruc="402")
    non_authority_institution = Institucion.objects.create(nombre="Non authority", codigo="OTHER", ruc="403")
    authority = Usuario.objects.create_user(numero_identificacion="501")
    inactive_authority = Usuario.objects.create_user(numero_identificacion="502")
    non_authority = Usuario.objects.create_user(numero_identificacion="503")
    docente = Rol.objects.create(nombre=Rol.DOCENTE)
    UsuarioRol.objects.create(
        usuario=authority, rol=roles[Rol.AUTORIDAD_ACADEMICA], institucion=authority_institution
    )
    inactive_assignment = UsuarioRol.objects.create(
        usuario=inactive_authority,
        rol=roles[Rol.AUTORIDAD_ACADEMICA],
        institucion=inactive_institution,
    )
    inactive_assignment.desactivar()
    UsuarioRol.objects.create(
        usuario=non_authority, rol=docente, institucion=non_authority_institution
    )

    assert [row["id"] for row in authenticated_client(authority).get("/api/instituciones/usuario/").data] == [authority_institution.id]
    assert authenticated_client(inactive_authority).get("/api/instituciones/usuario/").data == []
    assert authenticated_client(non_authority).get("/api/instituciones/usuario/").data == []


@pytest.mark.django_db
@pytest.mark.parametrize("field", ["nombre", "codigo", "ruc"])
@pytest.mark.parametrize("descending", [False, True])
def test_all_documented_ordering_fields_and_directions(admin_client, field, descending):
    first = Institucion.objects.create(nombre="Alpha", codigo="A", ruc="1")
    second = Institucion.objects.create(nombre="Beta", codigo="B", ruc="2")
    ordering = f"-{'%s' % field}" if descending else field
    response = admin_client.get(f"/api/instituciones/?ordering={ordering}")
    expected = [second.id, first.id] if descending else [first.id, second.id]
    assert [row["id"] for row in response.data["results"]] == expected


@pytest.mark.django_db
def test_pagination_navigation_and_authority_filtering(admin_client, roles):
    first = Institucion.objects.create(nombre="Alpha", codigo="A", ruc="1")
    Institucion.objects.create(nombre="Beta", codigo="B", ruc="2")
    active = Usuario.objects.create_user(numero_identificacion="401")
    inactive = Usuario.objects.create_user(numero_identificacion="402")
    non_authority = Usuario.objects.create_user(numero_identificacion="403")
    UsuarioRol.objects.create(usuario=active, rol=roles[Rol.AUTORIDAD_ACADEMICA], institucion=first)
    old = UsuarioRol.objects.create(usuario=inactive, rol=roles[Rol.AUTORIDAD_ACADEMICA], institucion=first)
    old.desactivar()
    UsuarioRol.objects.create(usuario=non_authority, rol=roles[Rol.ADMINISTRADOR], institucion=first)
    page_one = admin_client.get("/api/instituciones/?page_size=1&page=1")
    assert set(page_one.data) == {"count", "next", "previous", "results"}
    assert page_one.data["count"] == 2 and page_one.data["next"] and page_one.data["previous"] is None
    assert len(page_one.data["results"][0]["autoridades_academicas"]) == 1
    assert page_one.data["results"][0]["autoridades_academicas"][0]["usuario"]["username"] == "401"
    page_two = admin_client.get("/api/instituciones/?page_size=1&page=2")
    assert page_two.data["next"] is None and page_two.data["previous"]
