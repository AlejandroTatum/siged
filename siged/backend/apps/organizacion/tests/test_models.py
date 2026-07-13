from datetime import date

import pytest
from django.db import IntegrityError
from django.db.models import CASCADE

from apps.core.models import Usuario
from apps.organizacion.models import Institucion, Rol, UsuarioRol


@pytest.mark.django_db
def test_institution_code_remains_unique():
    legacy = Institucion.objects.create(nombre="Legacy", codigo="INST042", ruc="179042")

    assert legacy.codigo == "INST042"
    assert Institucion._meta.get_field("codigo").unique is True


@pytest.mark.django_db
def test_models_match_teacher_data_contract():
    assert isinstance(Institucion._meta.pk, __import__("django").db.models.BigAutoField)
    assert isinstance(Rol._meta.pk, __import__("django").db.models.BigAutoField)
    assert isinstance(UsuarioRol._meta.pk, __import__("django").db.models.BigAutoField)
    assert {field.name for field in Rol._meta.fields} == {"id", "nombre"}
    assert Rol._meta.get_field("nombre").unique is True
    assert dict(Rol._meta.get_field("nombre").choices) == {
        Rol.ADMINISTRADOR: "Administrador",
        Rol.AUTORIDAD_ACADEMICA: "Autoridad académica",
        Rol.DECE: "DECE",
        Rol.DOCENTE: "Docente",
        Rol.ESTUDIANTE: "Estudiante",
        Rol.SECRETARIA: "Secretaría",
    }
    assert Institucion._meta.get_field("fecha_actualizacion").null is True
    assert {field.name for field in UsuarioRol._meta.fields} == {
        "id", "es_activo", "fecha_desde", "fecha_hasta", "institucion", "rol", "usuario"
    }
    assert UsuarioRol._meta.get_field("institucion").remote_field.on_delete is CASCADE
    assert UsuarioRol._meta.constraints == []


@pytest.mark.django_db
@pytest.mark.parametrize("field", ["nombre", "codigo", "ruc"])
def test_institution_identity_fields_are_unique(field):
    original = {"nombre": "Colegio Uno", "codigo": "C001", "ruc": "179001"}
    Institucion.objects.create(**original)
    duplicate = {"nombre": "Colegio Dos", "codigo": "C002", "ruc": "179002"}
    duplicate[field] = original[field]
    with pytest.raises(IntegrityError):
        Institucion.objects.create(**duplicate)


@pytest.mark.django_db
def test_assignment_lifecycle_dates_follow_domain_rules():
    user = Usuario.objects.create_user("0101010101")
    role = Rol.objects.create(nombre=Rol.ADMINISTRADOR)
    assignment = UsuarioRol.objects.create(usuario=user, rol=role, es_activo=False)
    assignment.activar()
    assert (assignment.es_activo, assignment.fecha_desde, assignment.fecha_hasta) == (True, date.today(), None)
    assignment.desactivar()
    assert (assignment.es_activo, assignment.fecha_hasta) == (False, date.today())
