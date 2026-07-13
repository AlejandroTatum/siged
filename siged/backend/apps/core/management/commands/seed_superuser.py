"""
Comando de administración para crear el superusuario inicial.

Crea el superusuario por defecto del sistema SIGED
si no existe previamente, usando los valores definidos en
AGENTS.md.

Uso:
    python manage.py seed_superuser
"""

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError

Usuario = get_user_model()

SUPERUSER_DATA = {
    "numero_identificacion": "000000001",
    "password": "admin123",
    "is_superuser": True,
    "is_staff": True,
    "is_active": True,
    "first_name": "Administrador",
    "last_name": "Sistema",
    "email": "admin@example.com",
}


class Command(BaseCommand):
    help = "Crea o restablece el superusuario local documentado de SIGED"

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Restablece los datos y la contraseña del administrador local.",
        )

    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError(
                "seed_superuser solo está disponible con DEBUG=True. "
                "Use una provisión segura de credenciales en producción."
            )

        usuario = Usuario.objects.filter(
            numero_identificacion=SUPERUSER_DATA["numero_identificacion"]
        ).first()
        if usuario and not options["reset"]:
            self.stdout.write(
                self.style.WARNING(
                    f"El superusuario '{SUPERUSER_DATA['numero_identificacion']}' "
                    "ya existe. Use --reset para restaurar las credenciales documentadas."
                )
            )
            return

        if usuario:
            for field, value in SUPERUSER_DATA.items():
                if field != "password":
                    setattr(usuario, field, value)
            usuario.set_password(SUPERUSER_DATA["password"])
            usuario.save()
            action = "restablecido"
        else:
            Usuario.objects.create_superuser(**SUPERUSER_DATA)
            action = "creado"

        self.stdout.write(
            self.style.SUCCESS(
                f"Superusuario '{SUPERUSER_DATA['numero_identificacion']}' "
                f"{action} correctamente."
            )
        )
