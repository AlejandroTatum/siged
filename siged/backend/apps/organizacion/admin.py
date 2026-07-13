from django.contrib import admin

from .models import (
    Asignatura,
    EducacionNivel,
    EducacionSubnivel,
    GradoEscolar,
    Institucion,
    PlanEstudio,
    Rol,
    UsuarioRol,
)

admin.site.register(Asignatura)
admin.site.register(EducacionNivel)
admin.site.register(EducacionSubnivel)
admin.site.register(GradoEscolar)
admin.site.register(Institucion)
admin.site.register(PlanEstudio)
admin.site.register(Rol)
admin.site.register(UsuarioRol)
