from django.db import migrations, models
import django.db.models.deletion


def copy_role_code(apps, schema_editor):
    Rol = apps.get_model("organizacion", "Rol")
    for role in Rol.objects.all():
        role.nombre = role.codigo
        role.save(update_fields=["nombre"])


class Migration(migrations.Migration):
    dependencies = [("organizacion", "0002_seed_roles_and_admin")]
    operations = [
        migrations.RunPython(copy_role_code, migrations.RunPython.noop),
        migrations.RemoveField("rol", "codigo"),
        migrations.AlterField("rol", "nombre", models.CharField(choices=[("ADMINISTRADOR", "Administrador"), ("AUTORIDAD_ACADEMICA", "Autoridad académica"), ("DECE", "DECE"), ("DOCENTE", "Docente"), ("ESTUDIANTE", "Estudiante"), ("SECRETARIA", "Secretaría")], max_length=30, unique=True)),
        migrations.AlterModelOptions("rol", options={"ordering": ["nombre"], "verbose_name": "rol", "verbose_name_plural": "roles"}),
        migrations.AlterModelOptions("institucion", options={"ordering": ["nombre"], "verbose_name": "institución", "verbose_name_plural": "instituciones"}),
        migrations.RemoveField("usuariorol", "institucion_codigo"),
        migrations.RemoveField("usuariorol", "institucion_nombre"),
        migrations.AlterField("usuariorol", "institucion", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name="asignaciones", to="organizacion.institucion")),
        migrations.AlterModelOptions("usuariorol", options={"ordering": ["usuario_id", "rol_id", "institucion_id"], "verbose_name": "rol de usuario", "verbose_name_plural": "roles de usuario"}),
    ]
