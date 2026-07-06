"""
Comando de administración para crear el superusuario inicial.

Crea el superusuario por defecto del sistema SIGED
si no existe previamente, usando los valores definidos en
AGENTS.md.

Uso:
    python manage.py seed_superuser
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

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
    help = "Crea el superusuario inicial del sistema SIGED"

    def handle(self, *args, **options):
        if Usuario.objects.filter(
            numero_identificacion=SUPERUSER_DATA["numero_identificacion"]
        ).exists():
            self.stdout.write(
                self.style.WARNING(
                    f"El superusuario '{SUPERUSER_DATA['numero_identificacion']}' "
                    f"ya existe."
                )
            )
            return

        Usuario.objects.create_superuser(
            numero_identificacion=SUPERUSER_DATA["numero_identificacion"],
            password=SUPERUSER_DATA["password"],
            is_superuser=SUPERUSER_DATA["is_superuser"],
            is_staff=SUPERUSER_DATA["is_staff"],
            is_active=SUPERUSER_DATA["is_active"],
            first_name=SUPERUSER_DATA["first_name"],
            last_name=SUPERUSER_DATA["last_name"],
            email=SUPERUSER_DATA["email"],
        )
        self.stdout.write(
            self.style.SUCCESS(
                f"Superusuario '{SUPERUSER_DATA['numero_identificacion']}' "
                f"creado correctamente."
            )
        )
