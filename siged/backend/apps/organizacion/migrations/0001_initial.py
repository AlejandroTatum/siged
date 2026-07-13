from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True
    dependencies = [migrations.swappable_dependency(settings.AUTH_USER_MODEL)]
    operations = [
        migrations.CreateModel(name="Institucion", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("codigo", models.CharField(max_length=20, unique=True)),
            ("fecha_actualizacion", models.DateTimeField(auto_now=True, null=True)),
            ("fecha_creacion", models.DateTimeField(auto_now_add=True)),
            ("nombre", models.CharField(max_length=200, unique=True)),
            ("ruc", models.CharField(max_length=20, unique=True)),
        ], options={"ordering": ["nombre"]}),
        migrations.CreateModel(name="Rol", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("codigo", models.CharField(max_length=30, unique=True)),
            ("nombre", models.CharField(max_length=100)),
        ], options={"ordering": ["codigo"]}),
        migrations.CreateModel(name="UsuarioRol", fields=[
            ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
            ("es_activo", models.BooleanField(default=True)),
            ("fecha_desde", models.DateField(blank=True, null=True)),
            ("fecha_hasta", models.DateField(blank=True, null=True)),
            ("institucion_codigo", models.CharField(blank=True, default="", max_length=20)),
            ("institucion_nombre", models.CharField(blank=True, default="", max_length=200)),
            ("institucion", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="asignaciones", to="organizacion.institucion")),
            ("rol", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="asignaciones", to="organizacion.rol")),
            ("usuario", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="asignaciones_roles", to=settings.AUTH_USER_MODEL)),
        ], options={"ordering": ["usuario_id", "rol_id", "institucion_id"]}),
    ]
