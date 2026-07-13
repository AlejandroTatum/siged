from django.db import IntegrityError
from rest_framework import serializers

from apps.organizacion.daos.plan_estudio_dao import PlanEstudioDAO
from apps.organizacion.excepciones import PlanEstudioActivoExistente
from apps.organizacion.models import PlanEstudio
from apps.organizacion.servicios.plan_estudio_servicio import PlanEstudioServicio


class PlanEstudioSerializer(serializers.ModelSerializer):
    es_activo = serializers.BooleanField(
        required=True, error_messages={"required": "Este campo es obligatorio."}
    )
    nombre = serializers.CharField(
        max_length=200, error_messages={"required": "Este campo es obligatorio."}
    )

    class Meta:
        model = PlanEstudio
        fields = [
            "id", "nombre", "es_activo", "institucion", "fecha_creacion", "fecha_actualizacion"
        ]
        read_only_fields = ["fecha_creacion", "fecha_actualizacion"]
        validators = []

    def create(self, validated_data):
        try:
            return PlanEstudioServicio.crear(validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        view = self.context.get("view")
        if view and view.action == "retrieve":
            representation["institucion"] = {
                "id": instance.institucion_id,
                "nombre": instance.institucion.nombre,
            }
        return representation

    def update(self, instance, validated_data):
        validated_data.pop("institucion", None)
        try:
            return PlanEstudioServicio.actualizar(instance, validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def validate(self, attrs):
        institution = attrs.get("institucion") or getattr(self.instance, "institucion", None)
        nombre = attrs.get("nombre", getattr(self.instance, "nombre", None))
        if institution and nombre and PlanEstudioDAO.existe_nombre(
            institution.pk, nombre, excluir_pk=getattr(self.instance, "pk", None)
        ):
            raise serializers.ValidationError({
                "nombre": ["plan de estudio con este nombre ya existe en esta institución."]
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
        if "plan_nombre_por_institucion_uniq" in text or (
            "planestudio.institucion_id" in text and "planestudio.nombre" in text
        ):
            raise serializers.ValidationError({
                "nombre": ["plan de estudio con este nombre ya existe en esta institución."]
            }) from error
        if "plan_activo_por_institucion_uniq" in text or (
            "planestudio.institucion_id" in text and "planestudio.nombre" not in text
        ):
            raise PlanEstudioActivoExistente from error
        raise error
