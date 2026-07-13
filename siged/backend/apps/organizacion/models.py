from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class EducacionNivel(models.Model):
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=100, unique=True)
    pp_minutos = models.PositiveIntegerField()
    pp_semana_minimo = models.PositiveIntegerField()

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(pp_minutos__gt=0), name="nivel_pp_minutos_gt_0"),
            models.CheckConstraint(
                check=models.Q(pp_semana_minimo__gt=0), name="nivel_pp_semana_gt_0"
            ),
        ]
        ordering = ["nombre"]
        verbose_name = "nivel educativo"
        verbose_name_plural = "niveles educativos"

    def __str__(self):
        return self.nombre


class EducacionSubnivel(models.Model):
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=100)
    pp_semana_minimo = models.PositiveIntegerField()
    educacion_nivel = models.ForeignKey(
        EducacionNivel, on_delete=models.PROTECT, related_name="subniveles"
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(pp_semana_minimo__gt=0), name="subnivel_pp_semana_gt_0"
            ),
            models.UniqueConstraint(
                fields=["educacion_nivel", "nombre"], name="subnivel_nombre_por_nivel_uniq"
            ),
        ]
        ordering = ["educacion_nivel_id", "nombre"]
        verbose_name = "subnivel educativo"
        verbose_name_plural = "subniveles educativos"

    def __str__(self):
        return f"{self.educacion_nivel} — {self.nombre}"


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


class PlanEstudio(models.Model):
    es_activo = models.BooleanField(default=False)
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=200)
    institucion = models.ForeignKey(
        Institucion, on_delete=models.PROTECT, related_name="planes_estudio"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["institucion", "nombre"], name="plan_nombre_por_institucion_uniq"
            ),
            models.UniqueConstraint(
                condition=models.Q(es_activo=True),
                fields=["institucion"],
                name="plan_activo_por_institucion_uniq",
            ),
        ]
        ordering = ["nombre"]
        verbose_name = "plan de estudio"
        verbose_name_plural = "planes de estudio"

    def __str__(self):
        return self.nombre


class GradoEscolar(models.Model):
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=100)
    orden = models.PositiveIntegerField()
    nivel = models.ForeignKey(
        EducacionNivel, on_delete=models.PROTECT, related_name="grados_escolares"
    )
    plan_estudio = models.ForeignKey(
        PlanEstudio, on_delete=models.PROTECT, related_name="grados_escolares"
    )
    subnivel = models.ForeignKey(
        EducacionSubnivel,
        blank=True,
        null=True,
        on_delete=models.PROTECT,
        related_name="grados_escolares",
    )

    class Meta:
        constraints = [
            models.CheckConstraint(check=models.Q(orden__gt=0), name="grado_orden_gt_0"),
            models.UniqueConstraint(
                fields=["plan_estudio", "nombre"], name="grado_nombre_por_plan_uniq"
            ),
        ]
        ordering = ["orden", "nombre"]
        verbose_name = "grado escolar"
        verbose_name_plural = "grados escolares"

    def __str__(self):
        return self.nombre

    def clean(self):
        super().clean()
        if not self.nivel_id:
            return
        if self.subnivel_id and self.subnivel.educacion_nivel_id != self.nivel_id:
            raise ValidationError({"subnivel": "El subnivel debe pertenecer al nivel seleccionado."})
        if not self.subnivel_id and EducacionSubnivel.objects.filter(
            educacion_nivel_id=self.nivel_id
        ).exists():
            raise ValidationError({"subnivel": "Debe seleccionar un subnivel para este nivel."})


class Asignatura(models.Model):
    fecha_actualizacion = models.DateTimeField(auto_now=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    nombre = models.CharField(max_length=150)
    pp_semana_minimo = models.PositiveIntegerField()
    grado_escolar = models.ForeignKey(
        GradoEscolar, on_delete=models.PROTECT, related_name="asignaturas"
    )

    class Meta:
        constraints = [
            models.CheckConstraint(
                check=models.Q(pp_semana_minimo__gt=0), name="asignatura_pp_semana_gt_0"
            ),
            models.UniqueConstraint(
                fields=["grado_escolar", "nombre"], name="asignatura_nombre_por_grado_uniq"
            ),
        ]
        ordering = ["nombre"]
        verbose_name = "asignatura"
        verbose_name_plural = "asignaturas"

    def __str__(self):
        return self.nombre


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
