import pytest
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.models import Usuario
from apps.organizacion.models import GradoEscolar, Institucion, PlanEstudio, Rol, UsuarioRol


def authenticated_client(user):
    client = APIClient()
    token, _ = Token.objects.get_or_create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def plan_context(db):
    role = Rol.objects.create(nombre=Rol.AUTORIDAD_ACADEMICA)
    institution = Institucion.objects.create(nombre="Central", codigo="C", ruc="1")
    other_institution = Institucion.objects.create(nombre="Other", codigo="O", ruc="2")
    authority = Usuario.objects.create_user(numero_identificacion="100", password="secret")
    UsuarioRol.objects.create(usuario=authority, rol=role, institucion=institution)
    return {
        "client": authenticated_client(authority),
        "institution": institution,
        "other_institution": other_institution,
        "role": role,
    }


@pytest.mark.django_db
def test_list_is_scoped_paginated_searchable_and_orderable(plan_context):
    institution = plan_context["institution"]
    PlanEstudio.objects.create(nombre="Zulu 2025", es_activo=False, institucion=institution)
    PlanEstudio.objects.create(nombre="Alpha 2026", es_activo=True, institucion=institution)
    PlanEstudio.objects.create(
        nombre="Alpha Foreign", es_activo=True, institucion=plan_context["other_institution"]
    )

    url = f"/api/planes-estudio/instituciones/{institution.id}/"
    response = plan_context["client"].get(
        url, {"nombre": "alpha", "ordering": "-es_activo", "page_size": 1}
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    assert response.data["results"][0]["nombre"] == "Alpha 2026"
    assert set(response.data["results"][0]) == {
        "id", "nombre", "es_activo", "institucion", "fecha_creacion", "fecha_actualizacion"
    }


@pytest.mark.django_db
def test_crud_uses_documented_collection_and_object_routes(plan_context):
    institution = plan_context["institution"]
    created = plan_context["client"].post(
        "/api/planes-estudio/",
        {"nombre": " Plan 2026 ", "es_activo": True, "institucion": institution.id},
    )
    assert created.status_code == 201
    assert created.data["nombre"] == "Plan 2026"

    detail_url = f"/api/planes-estudio/{created.data['id']}/"
    detail = plan_context["client"].get(detail_url)
    assert detail.status_code == 200
    assert detail.data["institucion"] == {"id": institution.id, "nombre": institution.nombre}
    updated = plan_context["client"].patch(detail_url, {"nombre": "Plan Updated"})
    assert updated.status_code == 200
    assert updated.data["nombre"] == "Plan Updated"
    assert plan_context["client"].delete(detail_url).status_code == 204
    assert not PlanEstudio.objects.filter(pk=created.data["id"]).exists()


@pytest.mark.django_db
def test_contextual_duplicate_and_second_active_have_distinct_contracts(plan_context):
    institution = plan_context["institution"]
    PlanEstudio.objects.create(nombre="Plan 2026", es_activo=True, institucion=institution)

    duplicate = plan_context["client"].post(
        "/api/planes-estudio/",
        {"nombre": "Plan 2026", "es_activo": False, "institucion": institution.id},
    )
    assert duplicate.status_code == 400
    assert duplicate.data == {
        "nombre": ["plan de estudio con este nombre ya existe en esta institución."]
    }

    conflict = plan_context["client"].post(
        "/api/planes-estudio/",
        {"nombre": "Another", "es_activo": True, "institucion": institution.id},
    )
    assert conflict.status_code == 409
    assert conflict.data == {
        "non_field_errors": ["Ya existe un plan de estudio vigente para esta institución."]
    }


@pytest.mark.django_db
def test_delete_with_grades_returns_conflict(plan_context):
    from apps.organizacion.models import EducacionNivel

    institution = plan_context["institution"]
    plan = PlanEstudio.objects.create(nombre="Plan", institucion=institution)
    level = EducacionNivel.objects.create(
        nombre="General", pp_minutos=40, pp_semana_minimo=30
    )
    GradoEscolar.objects.create(nombre="First", orden=1, nivel=level, plan_estudio=plan)

    response = plan_context["client"].delete(f"/api/planes-estudio/{plan.id}/")
    assert response.status_code == 409
    assert response.data == {
        "error": "No se puede eliminar el plan de estudio porque tiene grados escolares asociados."
    }


@pytest.mark.django_db
def test_authentication_and_institution_authorization_are_enforced(plan_context):
    institution = plan_context["institution"]
    other = plan_context["other_institution"]
    foreign_plan = PlanEstudio.objects.create(nombre="Foreign", institucion=other)
    unassigned = Usuario.objects.create_user(numero_identificacion="200")
    unassigned_client = authenticated_client(unassigned)
    list_url = f"/api/planes-estudio/instituciones/{institution.id}/"

    assert APIClient().get(list_url).status_code == 401
    assert unassigned_client.get(list_url).status_code == 403
    assert plan_context["client"].get(
        f"/api/planes-estudio/instituciones/{other.id}/"
    ).status_code == 403
    assert plan_context["client"].get(f"/api/planes-estudio/{foreign_plan.id}/").status_code == 403
    denied_create = plan_context["client"].post(
        "/api/planes-estudio/",
        {"nombre": "Denied", "es_activo": False, "institucion": other.id},
    )
    assert denied_create.status_code == 403


@pytest.mark.django_db
@pytest.mark.parametrize("ordering", ["nombre", "-nombre", "es_activo", "-es_activo"])
def test_all_documented_orderings_are_accepted(plan_context, ordering):
    url = f"/api/planes-estudio/instituciones/{plan_context['institution'].id}/"
    assert plan_context["client"].get(url, {"ordering": ordering}).status_code == 200


@pytest.mark.django_db
def test_invalid_pagination_and_ordering_are_rejected(plan_context):
    url = f"/api/planes-estudio/instituciones/{plan_context['institution'].id}/"
    assert plan_context["client"].get(url, {"page": 0}).status_code == 400
    assert plan_context["client"].get(url, {"page_size": 0}).status_code == 400
    assert plan_context["client"].get(url, {"ordering": "institucion"}).status_code == 400
