from rest_framework import serializers

from apps.organizacion.models import Rol


class RolCatalogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ("id", "nombre")
