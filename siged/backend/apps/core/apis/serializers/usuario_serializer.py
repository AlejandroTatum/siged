from rest_framework import serializers

from apps.core.models import Usuario


class UsuarioSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="numero_identificacion")

    class Meta:
        model = Usuario
        fields = ["id", "username", "email", "first_name", "last_name", "numero_identificacion", "is_active"]
