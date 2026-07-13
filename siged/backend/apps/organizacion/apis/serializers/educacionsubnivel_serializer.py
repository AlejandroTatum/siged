from rest_framework import serializers

from apps.organizacion.models import EducacionSubnivel


class EducacionSubnivelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducacionSubnivel
        fields = ["id", "nombre", "pp_semana_minimo"]
