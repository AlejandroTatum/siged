"""
Modelo de datos para la aplicación Core.

Define el modelo de Usuario personalizado para SIGED,
extendiendo AbstractUser de Django y autenticando
por número de identificación.
"""

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class UsuarioManager(BaseUserManager):
    """
    Manager personalizado para el modelo Usuario.

    Gestiona la creación de usuarios y superusuarios
    usando numero_identificacion como identificador
    en lugar de username.
    """

    def create_user(
        self,
        numero_identificacion,
        password=None,
        **extra_fields,
    ):
        if not numero_identificacion:
            raise ValueError(
                "El número de identificación es obligatorio."
            )
        user = self.model(
            numero_identificacion=numero_identificacion,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(
        self,
        numero_identificacion,
        password=None,
        **extra_fields,
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self.create_user(
            numero_identificacion, password, **extra_fields
        )


class Usuario(AbstractUser):
    """
    Modelo de Usuario personalizado para SIGED.

    Extiende AbstractUser y utiliza `numero_identificacion`
    como campo de autenticación en lugar de `username`.

    Atributos:
        numero_identificacion: Identificador único para autenticación.
        first_name: Nombres del usuario (heredado).
        last_name: Apellidos del usuario (heredado).
        is_active: Estado de actividad de la cuenta.
    """

    username = None
    numero_identificacion = models.CharField(
        max_length=20,
        unique=True,
        verbose_name="número de identificación",
    )

    objects = UsuarioManager()

    USERNAME_FIELD = "numero_identificacion"
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = "usuario"
        verbose_name_plural = "usuarios"
        ordering = ["numero_identificacion"]

    def __str__(self):
        nombre_completo = self.get_full_name()
        if nombre_completo:
            return f"{self.numero_identificacion} — {nombre_completo}"
        return self.numero_identificacion
