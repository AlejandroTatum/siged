from django.conf import settings
from django.db import models
from django.utils import timezone


class Institucion(models.Model):
    codigo = models.CharField(max_length=20, unique=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=200, unique=True)
    ruc = models.CharField(max_length=20, unique=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "institución"
        verbose_name_plural = "instituciones"

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"


class Rol(models.Model):
    ADMINISTRADOR = "ADMINISTRADOR"
    AUTORIDAD_ACADEMICA = "AUTORIDAD_ACADEMICA"
    DECE = "DECE"
    DOCENTE = "DOCENTE"
    ESTUDIANTE = "ESTUDIANTE"
    SECRETARIA = "SECRETARIA"

    OPCIONES = (
        (ADMINISTRADOR, "Administrador"),
        (AUTORIDAD_ACADEMICA, "Autoridad académica"),
        (DECE, "DECE"),
        (DOCENTE, "Docente"),
        (ESTUDIANTE, "Estudiante"),
        (SECRETARIA, "Secretaría"),
    )

    nombre = models.CharField(max_length=30, choices=OPCIONES, unique=True)

    class Meta:
        ordering = ["nombre"]
        verbose_name = "rol"
        verbose_name_plural = "roles"

    def __str__(self):
        return self.nombre


class UsuarioRol(models.Model):
    es_activo = models.BooleanField(default=True)
    fecha_desde = models.DateField(blank=True, null=True)
    fecha_hasta = models.DateField(blank=True, null=True)
    institucion = models.ForeignKey(
        Institucion, blank=True, null=True, on_delete=models.CASCADE, related_name="asignaciones"
    )
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT, related_name="asignaciones")
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="asignaciones_roles"
    )

    class Meta:
        ordering = ["usuario_id", "rol_id", "institucion_id"]
        verbose_name = "rol de usuario"
        verbose_name_plural = "roles de usuario"

    def __str__(self):
        return f"{self.usuario} — {self.rol}"

    def activar(self):
        self.es_activo = True
        self.fecha_desde = timezone.localdate()
        self.fecha_hasta = None
        self.save(update_fields=["es_activo", "fecha_desde", "fecha_hasta"])

    def desactivar(self):
        self.es_activo = False
        self.fecha_hasta = timezone.localdate()
        self.save(update_fields=["es_activo", "fecha_hasta"])

    def save(self, *args, **kwargs):
        if self.es_activo and self.fecha_desde is None:
            self.fecha_desde = timezone.localdate()
        super().save(*args, **kwargs)
