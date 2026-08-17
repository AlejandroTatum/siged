import pytest
from django.core.management import call_command
from django.db.models import Sum

from apps.organizacion.models import (
    Asignatura,
    EducacionNivel,
    EducacionSubnivel,
    GradoEscolar,
    PlanEstudio,
)


@pytest.mark.django_db
class TestCatalogoEducativo:
    """The education-level catalog is reference data: it must exist on any fresh database."""

    def test_niveles_are_seeded_by_migration(self):
        assert EducacionNivel.objects.exists()

    def test_expected_niveles_are_present(self):
        nombres = set(EducacionNivel.objects.values_list("nombre", flat=True))
        assert {
            "Educación Inicial",
            "Educación General Básica",
            "Bachillerato General Unificado",
        } <= nombres

    def test_niveles_declare_positive_pedagogical_load(self):
        for nivel in EducacionNivel.objects.all():
            assert nivel.pp_minutos > 0
            assert nivel.pp_semana_minimo > 0

    def test_educacion_general_basica_exposes_its_subniveles(self):
        egb = EducacionNivel.objects.get(nombre="Educación General Básica")
        nombres = set(egb.subniveles.values_list("nombre", flat=True))
        assert {
            "Preparatoria",
            "Básica Elemental",
            "Básica Media",
            "Básica Superior",
        } <= nombres

    def test_subniveles_declare_positive_weekly_minimum(self):
        for subnivel in EducacionSubnivel.objects.all():
            assert subnivel.pp_semana_minimo > 0


@pytest.fixture
def debug_enabled(settings):
    """seed_demo is guarded behind DEBUG so it can never run against production."""
    settings.DEBUG = True
    return settings


@pytest.mark.django_db
@pytest.mark.usefixtures("debug_enabled")
class TestSeedDemo:
    """seed_demo must leave a fully walkable planning tree behind."""

    def test_creates_an_active_plan_with_grados_and_asignaturas(self):
        call_command("seed_demo")

        plan = PlanEstudio.objects.get(es_activo=True)
        assert plan.grados_escolares.count() >= 4
        assert Asignatura.objects.filter(grado_escolar__plan_estudio=plan).exists()

    def test_every_grado_resolves_a_subnivel_when_its_nivel_has_one(self):
        call_command("seed_demo")

        for grado in GradoEscolar.objects.select_related("nivel"):
            if grado.nivel.subniveles.exists():
                assert grado.subnivel_id is not None

    def test_seeds_one_grado_that_meets_its_minimum_and_one_that_does_not(self):
        call_command("seed_demo")

        alerts = set()
        for grado in GradoEscolar.objects.select_related("nivel", "subnivel"):
            actual = grado.asignaturas.aggregate(total=Sum("pp_semana_minimo"))["total"] or 0
            minimo = (
                grado.subnivel.pp_semana_minimo
                if grado.subnivel_id
                else grado.nivel.pp_semana_minimo
            )
            alerts.add(actual < minimo)

        assert alerts == {True, False}, "RF-017 needs both a satisfied and an alerting grado"

    def test_is_idempotent(self):
        call_command("seed_demo")
        counts = (
            PlanEstudio.objects.count(),
            GradoEscolar.objects.count(),
            Asignatura.objects.count(),
        )

        call_command("seed_demo")

        assert counts == (
            PlanEstudio.objects.count(),
            GradoEscolar.objects.count(),
            Asignatura.objects.count(),
        )
