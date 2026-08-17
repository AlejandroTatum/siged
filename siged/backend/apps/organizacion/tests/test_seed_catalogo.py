import pytest

from apps.organizacion.models import (
    EducacionNivel,
    EducacionSubnivel,
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
