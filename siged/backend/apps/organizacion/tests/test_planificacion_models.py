import pytest
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.db.models import PROTECT
from django.db.models.deletion import ProtectedError

from apps.organizacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubnivel,
    GradoEscolar,
    Institucion,
    PlanEstudio,
)


@pytest.fixture
def institucion():
    return Institucion.objects.create(codigo="INST001", nombre="Colegio Central", ruc="179001")


@pytest.fixture
def nivel():
    return EducacionNivel.objects.create(
        nombre="Educación General Básica", pp_minutos=40, pp_semana_minimo=30
    )


@pytest.fixture
def plan(institucion):
    return PlanEstudio.objects.create(institucion=institucion, nombre="Plan 2026")


@pytest.mark.django_db
def test_catalog_loads_and_grade_order_must_be_positive(institucion):
    with pytest.raises(IntegrityError), transaction.atomic():
        EducacionNivel.objects.create(nombre="Inválido", pp_minutos=0, pp_semana_minimo=30)

    nivel = EducacionNivel.objects.create(nombre="Bachillerato", pp_minutos=45, pp_semana_minimo=20)
    with pytest.raises(IntegrityError), transaction.atomic():
        EducacionSubnivel.objects.create(
            educacion_nivel=nivel, nombre="Inválido", pp_semana_minimo=0
        )

    plan = PlanEstudio.objects.create(institucion=institucion, nombre="Plan")
    with pytest.raises(IntegrityError), transaction.atomic():
        GradoEscolar.objects.create(nombre="Primero", nivel=nivel, orden=0, plan_estudio=plan)


@pytest.mark.django_db
def test_planning_models_are_registered_in_django_admin():
    assert {
        Asignatura,
        EducacionNivel,
        EducacionSubnivel,
        GradoEscolar,
        PlanEstudio,
    }.issubset(admin.site._registry)


@pytest.mark.django_db
def test_contextual_names_are_unique_but_reusable_in_another_parent(institucion, nivel):
    other_institution = Institucion.objects.create(
        codigo="INST002", nombre="Colegio Norte", ruc="179002"
    )
    first_plan = PlanEstudio.objects.create(institucion=institucion, nombre="Plan General")
    PlanEstudio.objects.create(institucion=other_institution, nombre="Plan General")
    with pytest.raises(IntegrityError), transaction.atomic():
        PlanEstudio.objects.create(institucion=institucion, nombre="Plan General")

    other_plan = PlanEstudio.objects.create(institucion=institucion, nombre="Plan Alternativo")
    first_grade = GradoEscolar.objects.create(
        nombre="Primero", nivel=nivel, orden=1, plan_estudio=first_plan
    )
    GradoEscolar.objects.create(nombre="Primero", nivel=nivel, orden=1, plan_estudio=other_plan)
    with pytest.raises(IntegrityError), transaction.atomic():
        GradoEscolar.objects.create(
            nombre="Primero", nivel=nivel, orden=2, plan_estudio=first_plan
        )

    other_grade = GradoEscolar.objects.create(
        nombre="Segundo", nivel=nivel, orden=2, plan_estudio=first_plan
    )
    Asignatura.objects.create(grado_escolar=first_grade, nombre="Matemática", pp_semana_minimo=5)
    Asignatura.objects.create(grado_escolar=other_grade, nombre="Matemática", pp_semana_minimo=5)
    with pytest.raises(IntegrityError), transaction.atomic():
        Asignatura.objects.create(
            grado_escolar=first_grade, nombre="Matemática", pp_semana_minimo=4
        )


@pytest.mark.django_db
def test_only_one_active_study_plan_is_allowed_per_institution(institucion):
    PlanEstudio.objects.create(es_activo=True, institucion=institucion, nombre="Vigente")

    with pytest.raises(IntegrityError), transaction.atomic():
        PlanEstudio.objects.create(es_activo=True, institucion=institucion, nombre="Otro vigente")

    PlanEstudio.objects.create(es_activo=False, institucion=institucion, nombre="Histórico")


@pytest.mark.django_db
def test_grade_sublevel_must_be_required_and_belong_to_its_level(institucion, nivel):
    subnivel = EducacionSubnivel.objects.create(
        educacion_nivel=nivel, nombre="Elemental", pp_semana_minimo=25
    )
    other_level = EducacionNivel.objects.create(
        nombre="Bachillerato", pp_minutos=45, pp_semana_minimo=20
    )
    plan = PlanEstudio.objects.create(institucion=institucion, nombre="Plan")

    with pytest.raises(ValidationError) as missing:
        GradoEscolar(
            nombre="Segundo", nivel=nivel, orden=2, plan_estudio=plan
        ).full_clean()
    assert "subnivel" in missing.value.message_dict

    with pytest.raises(ValidationError) as mismatched:
        GradoEscolar(
            nombre="Tercero",
            nivel=other_level,
            orden=3,
            plan_estudio=plan,
            subnivel=subnivel,
        ).full_clean()
    assert "subnivel" in mismatched.value.message_dict


@pytest.mark.django_db
def test_planning_relations_use_protected_deletion(institucion, nivel, plan):
    assert GradoEscolar._meta.get_field("plan_estudio").remote_field.on_delete is PROTECT
    assert Asignatura._meta.get_field("grado_escolar").remote_field.on_delete is PROTECT

    grade = GradoEscolar.objects.create(
        nombre="Primero", nivel=nivel, orden=1, plan_estudio=plan
    )
    with pytest.raises(ProtectedError):
        plan.delete()

    Asignatura.objects.create(grado_escolar=grade, nombre="Lengua", pp_semana_minimo=5)
    with pytest.raises(ProtectedError):
        grade.delete()


@pytest.mark.django_db
def test_subject_weekly_load_must_be_positive(nivel, plan):
    grade = GradoEscolar.objects.create(
        nombre="Primero", nivel=nivel, orden=1, plan_estudio=plan
    )

    with pytest.raises(IntegrityError), transaction.atomic():
        Asignatura.objects.create(grado_escolar=grade, nombre="Lengua", pp_semana_minimo=0)
