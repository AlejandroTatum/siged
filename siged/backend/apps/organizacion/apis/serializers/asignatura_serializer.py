from django.db import IntegrityError
from rest_framework import serializers

from apps.organizacion.daos.asignatura_dao import AsignaturaDAO
from apps.organizacion.models import Asignatura, GradoEscolar
from apps.organizacion.servicios.asignatura_servicio import AsignaturaServicio


class AsignaturaSerializer(serializers.ModelSerializer):
    grado_escolar = serializers.PrimaryKeyRelatedField(
        queryset=GradoEscolar.objects.all(),
        error_messages={"required": "Este campo es obligatorio."},
    )
    nombre = serializers.CharField(
        max_length=150, error_messages={"required": "Este campo es obligatorio."}
    )
    pp_semana_minimo = serializers.IntegerField(
        min_value=1, error_messages={"required": "Este campo es obligatorio."}
    )

    class Meta:
        model = Asignatura
        fields = [
            "id", "nombre", "pp_semana_minimo", "grado_escolar",
            "fecha_creacion", "fecha_actualizacion",
        ]
        read_only_fields = ["fecha_creacion", "fecha_actualizacion"]
        validators = []

    def create(self, validated_data):
        try:
            return AsignaturaServicio.crear(validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if getattr(self.context.get("view"), "action", None) == "retrieve":
            representation["grado_escolar"] = {
                "id": instance.grado_escolar_id,
                "nombre": instance.grado_escolar.nombre,
                "orden": instance.grado_escolar.orden,
            }
        return representation

    def update(self, instance, validated_data):
        validated_data.pop("grado_escolar", None)
        try:
            return AsignaturaServicio.actualizar(instance, validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def validate(self, attrs):
        grade = attrs.get("grado_escolar") or getattr(self.instance, "grado_escolar", None)
        nombre = attrs.get("nombre", getattr(self.instance, "nombre", None))
        if grade and nombre and AsignaturaDAO.existe_nombre(
            grade.pk, nombre, excluir_pk=getattr(self.instance, "pk", None)
        ):
            raise serializers.ValidationError({
                "nombre": ["asignatura con este nombre ya existe en este grado escolar."]
            })
        return attrs

    def validate_nombre(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Este campo no puede estar en blanco.")
        return value

    @staticmethod
    def _raise_unique_race_validation(error):
        text = str(error).lower()
        if "asignatura_nombre_por_grado_uniq" in text or (
            "asignatura.grado_escolar_id" in text and "asignatura.nombre" in text
        ):
            raise serializers.ValidationError({
                "nombre": ["asignatura con este nombre ya existe en este grado escolar."]
            }) from error
        raise error
