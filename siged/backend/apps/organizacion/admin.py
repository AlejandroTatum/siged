from django.contrib import admin

from .models import Institucion, Rol, UsuarioRol

admin.site.register(Institucion)
admin.site.register(Rol)
admin.site.register(UsuarioRol)
