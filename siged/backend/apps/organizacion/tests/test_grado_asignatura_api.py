import pytest
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from apps.core.models import Usuario
from apps.organizacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubnivel,
    GradoEscolar,
    Institucion,
    PlanEstudio,
    Rol,
    UsuarioRol,
)


def authenticated_client(user):
    client = APIClient()
    token, _ = Token.objects.get_or_create(user=user)
    client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")
    return client


@pytest.fixture
def planning_context(db):
    role, _ = Rol.objects.get_or_create(nombre=Rol.AUTORIDAD_ACADEMICA)
    institution = Institucion.objects.create(nombre="Central", codigo="C", ruc="1")
    foreign_institution = Institucion.objects.create(nombre="Foreign", codigo="F", ruc="2")
    authority = Usuario.objects.create_user(numero_identificacion="100", password="secret")
    UsuarioRol.objects.create(usuario=authority, rol=role, institucion=institution)
    plan = PlanEstudio.objects.create(nombre="Plan Central", institucion=institution)
    foreign_plan = PlanEstudio.objects.create(nombre="Plan Foreign", institucion=foreign_institution)
    level = EducacionNivel.objects.create(
        nombre="Primaria", pp_minutos=40, pp_semana_minimo=25
    )
    sublevel = EducacionSubnivel.objects.create(
        nombre="Primer ciclo", pp_semana_minimo=22, educacion_nivel=level
    )
    plain_level = EducacionNivel.objects.create(
        nombre="Inicial", pp_minutos=30, pp_semana_minimo=20
    )
    return {
        "client": authenticated_client(authority),
        "foreign_plan": foreign_plan,
        "institution": institution,
        "level": level,
        "plan": plan,
        "plain_level": plain_level,
        "sublevel": sublevel,
    }


@pytest.mark.django_db
def test_education_level_catalog_is_authenticated_nested_and_read_only(planning_context):
    response = planning_context["client"].get("/api/educacion-niveles/")

    assert response.status_code == 200
    primary = next(item for item in response.data if item["id"] == planning_context["level"].id)
    assert primary == {
        "id": planning_context["level"].id,
        "nombre": "Primaria",
        "pp_minutos": 40,
        "pp_semana_minimo": 25,
        "subniveles": [
            {
                "id": planning_context["sublevel"].id,
                "nombre": "Primer ciclo",
                "pp_semana_minimo": 22,
            }
        ],
    }
    assert APIClient().get("/api/educacion-niveles/").status_code == 401
    assert planning_context["client"].post("/api/educacion-niveles/", {}).status_code == 405


@pytest.mark.django_db
def test_grade_list_is_scoped_paginated_searchable_orderable_and_calculates_load(planning_context):
    grade = GradoEscolar.objects.create(
        nombre="Primero", orden=2, plan_estudio=planning_context["plan"],
        nivel=planning_context["level"], subnivel=planning_context["sublevel"],
    )
    Asignatura.objects.create(nombre="Lengua", pp_semana_minimo=12, grado_escolar=grade)
    Asignatura.objects.create(nombre="Matemáticas", pp_semana_minimo=8, grado_escolar=grade)
    GradoEscolar.objects.create(
        nombre="Segundo", orden=1, plan_estudio=planning_context["plan"],
        nivel=planning_context["plain_level"],
    )
    GradoEscolar.objects.create(
        nombre="Foreign", orden=1, plan_estudio=planning_context["foreign_plan"],
        nivel=planning_context["plain_level"],
    )

    response = planning_context["client"].get(
        f"/api/grados-escolares/planes-estudio/{planning_context['plan'].id}/",
        {"nombre": "primer", "ordering": "-nombre", "page_size": 1},
    )

    assert response.status_code == 200
    assert response.data["count"] == 1
    result = response.data["results"][0]
    assert result["nombre"] == "Primero"
    assert result["nivel"] == {"id": planning_context["level"].id, "nombre": "Primaria"}
    assert result["subnivel"] == {
        "id": planning_context["sublevel"].id, "nombre": "Primer ciclo"
    }
    assert result["carga_pedagogica_actual"] == 20
    assert result["carga_pedagogica_minima"] == 22
    assert result["alerta_carga_pedagogica"] is True


@pytest.mark.django_db
@pytest.mark.parametrize("ordering", ["orden", "-orden", "nombre", "-nombre", "nivel", "-nivel", "subnivel", "-subnivel"])
def test_grade_list_accepts_every_documented_ordering(planning_context, ordering):
    response = planning_context["client"].get(
        f"/api/grados-escolares/planes-estudio/{planning_context['plan'].id}/",
        {"ordering": ordering},
    )
    assert response.status_code == 200


@pytest.mark.django_db
def test_grade_crud_uses_documented_routes_and_detail_contract(planning_context):
    created = planning_context["client"].post(
        "/api/grados-escolares/",
        {
            "nombre": " Primero ", "orden": 1,
            "plan_estudio": planning_context["plan"].id,
            "nivel": planning_context["level"].id,
            "subnivel": planning_context["sublevel"].id,
        },
    )
    assert created.status_code == 201
    assert created.data["nombre"] == "Primero"
    assert created.data["plan_estudio"] == planning_context["plan"].id

    url = f"/api/grados-escolares/{created.data['id']}/"
    detail = planning_context["client"].get(url)
    assert detail.status_code == 200
    assert detail.data["plan_estudio"] == {
        "id": planning_context["plan"].id, "nombre": "Plan Central"
    }
    assert detail.data["nivel"]["pp_minutos"] == 40
    assert planning_context["client"].patch(url, {"nombre": "Primero A"}).status_code == 200
    assert planning_context["client"].delete(url).status_code == 204


@pytest.mark.django_db
def test_grade_validates_required_positive_contextual_unique_and_matching_sublevel(planning_context):
    base = {
        "nombre": "Primero", "orden": 1, "plan_estudio": planning_context["plan"].id,
        "nivel": planning_context["level"].id,
    }
    required_sublevel = planning_context["client"].post("/api/grados-escolares/", base)
    assert required_sublevel.status_code == 400
    assert required_sublevel.data == {
        "subnivel": ["Este campo es obligatorio para el nivel seleccionado."]
    }

    other_level = EducacionNivel.objects.create(
        nombre="Secundaria", pp_minutos=45, pp_semana_minimo=30
    )
    wrong_sublevel = planning_context["client"].post(
        "/api/grados-escolares/", {**base, "nivel": other_level.id, "subnivel": planning_context["sublevel"].id}
    )
    assert wrong_sublevel.status_code == 400
    assert "subnivel" in wrong_sublevel.data

    good = planning_context["client"].post(
        "/api/grados-escolares/", {**base, "subnivel": planning_context["sublevel"].id}
    )
    assert good.status_code == 201
    duplicate = planning_context["client"].post(
        "/api/grados-escolares/", {**base, "subnivel": planning_context["sublevel"].id}
    )
    assert duplicate.status_code == 400
    assert duplicate.data == {
        "nombre": ["grado escolar con este nombre ya existe en este plan de estudio."]
    }
    zero = planning_context["client"].post(
        "/api/grados-escolares/",
        {**base, "nombre": "Cero", "orden": 0, "nivel": planning_context["plain_level"].id},
    )
    assert zero.status_code == 400
    assert "orden" in zero.data


@pytest.mark.django_db
def test_grade_delete_is_protected_when_subjects_exist(planning_context):
    grade = GradoEscolar.objects.create(
        nombre="Primero", orden=1, plan_estudio=planning_context["plan"],
        nivel=planning_context["plain_level"],
    )
    Asignatura.objects.create(nombre="Lengua", pp_semana_minimo=5, grado_escolar=grade)
    response = planning_context["client"].delete(f"/api/grados-escolares/{grade.id}/")
    assert response.status_code == 409
    assert response.data == {
        "error": "No se puede eliminar el grado escolar porque tiene asignaturas asociadas."
    }


@pytest.mark.django_db
def test_subject_crud_list_and_detail_follow_contract(planning_context):
    grade = GradoEscolar.objects.create(
        nombre="Primero", orden=1, plan_estudio=planning_context["plan"],
        nivel=planning_context["plain_level"],
    )
    created = planning_context["client"].post(
        "/api/asignaturas/",
        {"nombre": " Matemáticas ", "pp_semana_minimo": 5, "grado_escolar": grade.id},
    )
    assert created.status_code == 201
    assert created.data["nombre"] == "Matemáticas"
    list_response = planning_context["client"].get(
        f"/api/asignaturas/grados-escolares/{grade.id}/"
    )
    assert list_response.status_code == 200
    assert list_response.data[0]["grado_escolar"] == grade.id

    url = f"/api/asignaturas/{created.data['id']}/"
    detail = planning_context["client"].get(url)
    assert detail.status_code == 200
    assert detail.data["grado_escolar"] == {"id": grade.id, "nombre": "Primero", "orden": 1}
    updated = planning_context["client"].patch(url, {"pp_semana_minimo": 6})
    assert updated.status_code == 200
    assert updated.data["pp_semana_minimo"] == 6
    assert planning_context["client"].delete(url).status_code == 204


@pytest.mark.django_db
def test_subject_validates_positive_periods_and_contextual_name_uniqueness(planning_context):
    grade = GradoEscolar.objects.create(
        nombre="Primero", orden=1, plan_estudio=planning_context["plan"],
        nivel=planning_context["plain_level"],
    )
    payload = {"nombre": "Lengua", "pp_semana_minimo": 5, "grado_escolar": grade.id}
    assert planning_context["client"].post("/api/asignaturas/", payload).status_code == 201
    duplicate = planning_context["client"].post("/api/asignaturas/", payload)
    assert duplicate.status_code == 400
    assert duplicate.data == {
        "nombre": ["asignatura con este nombre ya existe en este grado escolar."]
    }
    zero = planning_context["client"].post(
        "/api/asignaturas/", {**payload, "nombre": "Arte", "pp_semana_minimo": 0}
    )
    assert zero.status_code == 400
    assert "pp_semana_minimo" in zero.data


@pytest.mark.django_db
def test_nested_grade_and_subject_authorization_follows_owning_institution(planning_context):
    foreign_grade = GradoEscolar.objects.create(
        nombre="Foreign", orden=1, plan_estudio=planning_context["foreign_plan"],
        nivel=planning_context["plain_level"],
    )
    foreign_subject = Asignatura.objects.create(
        nombre="Foreign subject", pp_semana_minimo=5, grado_escolar=foreign_grade
    )
    client = planning_context["client"]
    assert client.get(
        f"/api/grados-escolares/planes-estudio/{planning_context['foreign_plan'].id}/"
    ).status_code == 403
    assert client.get(f"/api/grados-escolares/{foreign_grade.id}/").status_code == 403
    assert client.post(
        "/api/grados-escolares/",
        {"nombre": "Denied", "orden": 2, "plan_estudio": planning_context["foreign_plan"].id,
         "nivel": planning_context["plain_level"].id},
    ).status_code == 403
    assert client.get(
        f"/api/asignaturas/grados-escolares/{foreign_grade.id}/"
    ).status_code == 403
    assert client.get(f"/api/asignaturas/{foreign_subject.id}/").status_code == 403
    assert client.post(
        "/api/asignaturas/",
        {"nombre": "Denied", "pp_semana_minimo": 2, "grado_escolar": foreign_grade.id},
    ).status_code == 403


@pytest.mark.django_db
def test_grade_load_alert_falls_back_to_level_and_clears_at_minimum(planning_context):
    grade = GradoEscolar.objects.create(
        nombre="Inicial", orden=1, plan_estudio=planning_context["plan"],
        nivel=planning_context["plain_level"],
    )
    Asignatura.objects.create(nombre="Integrada", pp_semana_minimo=20, grado_escolar=grade)
    response = planning_context["client"].get(f"/api/grados-escolares/{grade.id}/")
    assert response.status_code == 200
    assert response.data["carga_pedagogica_actual"] == 20
    assert response.data["carga_pedagogica_minima"] == 20
    assert response.data["alerta_carga_pedagogica"] is False
