from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

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
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio


DEMO_PASSWORD = "SigedDemo2026!"
DEMO_USERS = (
    ("1100000001", "Carla", "Mendoza", Rol.ADMINISTRADOR),
    ("1100000002", "Daniel", "Paredes", Rol.AUTORIDAD_ACADEMICA),
    ("1100000003", "Elena", "Torres", Rol.DOCENTE),
    ("1100000004", "Mateo", "Cueva", Rol.ESTUDIANTE),
)
DEMO_INSTITUTIONS = (
    ("INST-DEMO-001", "Unidad Educativa Río Verde", "1190001001001"),
    ("INST-DEMO-002", "Colegio Técnico Loja Norte", "1190001002001"),
    ("INST-DEMO-003", "Escuela Comunitaria Vilcabamba", "1190001003001"),
)

DEMO_NIVEL = "Educación General Básica"
DEMO_PLAN = "Plan de Estudio 2026-2027"
# Weekly load adds up to the "Básica Elemental" minimum, so this grado shows no RF-017 alert.
ASIGNATURAS_ELEMENTAL = (
    ("Lengua y Literatura", 10),
    ("Matemática", 8),
    ("Educación Física", 5),
    ("Ciencias Naturales", 3),
    ("Estudios Sociales", 3),
    ("Educación Cultural y Artística", 3),
    ("Lengua Extranjera", 3),
)
# Deliberately below the "Básica Superior" minimum, so this grado does raise the RF-017 alert.
ASIGNATURAS_SUPERIOR = (
    ("Lengua y Literatura", 6),
    ("Matemática", 6),
    ("Ciencias Naturales", 4),
    ("Estudios Sociales", 4),
)
DEMO_GRADOS = (
    ("1ro de Básica", 1, "Preparatoria", ()),
    ("2do de Básica", 2, "Básica Elemental", ()),
    ("4to de Básica", 4, "Básica Elemental", ASIGNATURAS_ELEMENTAL),
    ("8vo de Básica", 8, "Básica Superior", ASIGNATURAS_SUPERIOR),
)


class Command(BaseCommand):
    help = "Crea datos locales repetibles para demostrar SIGED"

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("seed_demo solo está disponible con DEBUG=True.")

        Usuario = get_user_model()
        users_created = institutions_created = assignments_created = 0
        users = {}
        roles = {name: Rol.objects.get_or_create(nombre=name)[0] for name in dict(Rol.OPCIONES)}

        for identification, first_name, last_name, role_name in DEMO_USERS:
            user, created = Usuario.objects.get_or_create(
                numero_identificacion=identification,
                defaults={"first_name": first_name, "last_name": last_name, "is_active": True},
            )
            if created:
                user.set_password(DEMO_PASSWORD)
                user.save(update_fields=["password"])
                users_created += 1
            elif (
                user.first_name != first_name
                or user.last_name != last_name
                or not user.check_password(DEMO_PASSWORD)
            ):
                raise CommandError(
                    f"El identificador demo {identification} pertenece a una cuenta existente."
                )
            users[role_name] = user

        institutions = []
        for codigo, name, ruc in DEMO_INSTITUTIONS:
            institution = Institucion.objects.filter(ruc=ruc).first()
            if institution and (institution.codigo != codigo or institution.nombre != name):
                raise CommandError(
                    f"El RUC demo {ruc} pertenece a una institución existente distinta."
                )
            if institution is None:
                institution = InstitucionServicio.crear(
                    {"codigo": codigo, "nombre": name, "ruc": ruc}
                )
                institutions_created += 1
            institutions.append(institution)

        assignments = (
            (users[Rol.ADMINISTRADOR], roles[Rol.ADMINISTRADOR], None),
            (users[Rol.AUTORIDAD_ACADEMICA], roles[Rol.AUTORIDAD_ACADEMICA], institutions[0]),
            (users[Rol.DOCENTE], roles[Rol.DOCENTE], institutions[0]),
            (users[Rol.ESTUDIANTE], roles[Rol.ESTUDIANTE], institutions[0]),
        )
        for user, role, institution in assignments:
            _, created = UsuarioRol.objects.get_or_create(
                usuario=user, rol=role, institucion=institution, defaults={"es_activo": True}
            )
            assignments_created += int(created)

        plan, grados_created, asignaturas_created = self._seed_planificacion(institutions[0])

        self.stdout.write(self.style.SUCCESS(
            f"Demo lista: usuarios {users_created} creados/{len(DEMO_USERS) - users_created} reutilizados; "
            f"instituciones {institutions_created} creadas/{len(DEMO_INSTITUTIONS) - institutions_created} reutilizadas; "
            f"asignaciones {assignments_created} creadas/{len(assignments) - assignments_created} reutilizadas."
        ))
        self.stdout.write(self.style.SUCCESS(
            f"Planificación lista: plan '{plan.nombre}' en {institutions[0].nombre}; "
            f"grados {grados_created} creados/{len(DEMO_GRADOS) - grados_created} reutilizados; "
            f"asignaturas {asignaturas_created} creadas."
        ))
        self.stdout.write(f"Contraseña común para usuarios demo nuevos: {DEMO_PASSWORD}")
        for identification, first_name, last_name, role_name in DEMO_USERS:
            self.stdout.write(f"- {identification}: {first_name} {last_name} ({role_name})")

    def _seed_planificacion(self, institucion):
        try:
            nivel = EducacionNivel.objects.get(nombre=DEMO_NIVEL)
        except EducacionNivel.DoesNotExist:
            raise CommandError(
                f"No se encontró el nivel educativo '{DEMO_NIVEL}'. "
                "Ejecute las migraciones para cargar el catálogo educativo."
            )

        # The institution allows a single active plan, so an existing one is reused even if it
        # was renamed from the UI. Creating another active plan would break that constraint.
        plan = (
            PlanEstudio.objects.filter(institucion=institucion, nombre=DEMO_PLAN).first()
            or PlanEstudio.objects.filter(institucion=institucion, es_activo=True).first()
        )
        if plan is None:
            plan = PlanEstudio.objects.create(
                institucion=institucion, nombre=DEMO_PLAN, es_activo=True
            )

        grados_created = asignaturas_created = 0
        for nombre, orden, subnivel_nombre, asignaturas in DEMO_GRADOS:
            try:
                subnivel = EducacionSubnivel.objects.get(
                    educacion_nivel=nivel, nombre=subnivel_nombre
                )
            except EducacionSubnivel.DoesNotExist:
                raise CommandError(
                    f"No se encontró el subnivel educativo '{subnivel_nombre}'. "
                    "Ejecute las migraciones para cargar el catálogo educativo."
                )

            grado, created = GradoEscolar.objects.get_or_create(
                plan_estudio=plan,
                nombre=nombre,
                defaults={"orden": orden, "nivel": nivel, "subnivel": subnivel},
            )
            grados_created += int(created)

            for asignatura_nombre, pp_semana_minimo in asignaturas:
                _, created = Asignatura.objects.get_or_create(
                    grado_escolar=grado,
                    nombre=asignatura_nombre,
                    defaults={"pp_semana_minimo": pp_semana_minimo},
                )
                asignaturas_created += int(created)

        return plan, grados_created, asignaturas_created
