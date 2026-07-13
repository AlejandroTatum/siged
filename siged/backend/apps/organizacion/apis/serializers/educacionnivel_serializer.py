from rest_framework import serializers

from apps.organizacion.apis.serializers.educacionsubnivel_serializer import (
    EducacionSubnivelSerializer,
)
from apps.organizacion.models import EducacionNivel


class EducacionNivelSerializer(serializers.ModelSerializer):
    subniveles = EducacionSubnivelSerializer(many=True, read_only=True)

    class Meta:
        model = EducacionNivel
        fields = ["id", "nombre", "pp_minutos", "pp_semana_minimo", "subniveles"]
