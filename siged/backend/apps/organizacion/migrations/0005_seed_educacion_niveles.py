from django.db import migrations

# Reference data from the Ecuadorian LOEI curriculum. "pp" is a pedagogical period:
# pp_minutos is how long one period lasts, pp_semana_minimo the weekly minimum.
CATALOGO = [
    {
        "nombre": "Educación Inicial",
        "pp_minutos": 45,
        "pp_semana_minimo": 25,
        "subniveles": [
            ("Inicial 1", 25),
            ("Inicial 2", 25),
        ],
    },
    {
        "nombre": "Educación General Básica",
        "pp_minutos": 40,
        "pp_semana_minimo": 35,
        "subniveles": [
            ("Preparatoria", 25),
            ("Básica Elemental", 35),
            ("Básica Media", 35),
            ("Básica Superior", 35),
        ],
    },
    {
        "nombre": "Bachillerato General Unificado",
        "pp_minutos": 40,
        "pp_semana_minimo": 40,
        "subniveles": [],
    },
]


def seed_catalogo(apps, schema_editor):
    EducacionNivel = apps.get_model("organizacion", "EducacionNivel")
    EducacionSubnivel = apps.get_model("organizacion", "EducacionSubnivel")

    for entrada in CATALOGO:
        nivel, _ = EducacionNivel.objects.get_or_create(
            nombre=entrada["nombre"],
            defaults={
                "pp_minutos": entrada["pp_minutos"],
                "pp_semana_minimo": entrada["pp_semana_minimo"],
            },
        )
        for nombre, pp_semana_minimo in entrada["subniveles"]:
            EducacionSubnivel.objects.get_or_create(
                educacion_nivel=nivel,
                nombre=nombre,
                defaults={"pp_semana_minimo": pp_semana_minimo},
            )


def unseed_catalogo(apps, schema_editor):
    """Only remove catalog rows that nothing else depends on, so the reverse never breaks."""
    EducacionNivel = apps.get_model("organizacion", "EducacionNivel")
    EducacionSubnivel = apps.get_model("organizacion", "EducacionSubnivel")

    nombres = [entrada["nombre"] for entrada in CATALOGO]
    EducacionSubnivel.objects.filter(
        educacion_nivel__nombre__in=nombres, grados_escolares__isnull=True
    ).delete()
    EducacionNivel.objects.filter(
        nombre__in=nombres, grados_escolares__isnull=True, subniveles__isnull=True
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("organizacion", "0004_asignatura_educacionnivel_educacionsubnivel_and_more")
    ]

    operations = [migrations.RunPython(seed_catalogo, unseed_catalogo)]
