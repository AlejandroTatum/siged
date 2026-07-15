from django.db import IntegrityError
from rest_framework import serializers

from apps.organizacion.models import Institucion
from apps.organizacion.daos.institucion_dao import InstitucionDAO
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio


class UsuarioResumenSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    username = serializers.CharField(source="numero_identificacion")
    first_name = serializers.CharField()
    last_name = serializers.CharField()


class RolResumenSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    nombre = serializers.CharField()
    nombre_display = serializers.CharField(source="get_nombre_display")


class AutoridadAcademicaSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    usuario = UsuarioResumenSerializer()
    rol = RolResumenSerializer()
    es_activo = serializers.BooleanField()
    fecha_desde = serializers.DateField()


class InstitucionSerializer(serializers.ModelSerializer):
    autoridades_academicas = serializers.SerializerMethodField()
    codigo = serializers.CharField(
        max_length=20, error_messages={"required": "Este campo es obligatorio."}
    )
    nombre = serializers.CharField(
        max_length=200, error_messages={"required": "Este campo es obligatorio."}
    )
    ruc = serializers.CharField(
        max_length=20, error_messages={"required": "Este campo es obligatorio."}
    )

    class Meta:
        model = Institucion
        fields = [
            "id", "nombre", "codigo", "ruc", "fecha_creacion", "fecha_actualizacion",
            "autoridades_academicas",
        ]
        read_only_fields = ["fecha_creacion", "fecha_actualizacion"]

    def create(self, validated_data):
        try:
            return InstitucionServicio.crear(validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def get_autoridades_academicas(self, institution):
        assignments = getattr(institution, "autoridades_academicas_cache", None)
        if assignments is None:
            assignments = InstitucionDAO.autoridades_activas(institution)
        return AutoridadAcademicaSerializer(assignments, many=True).data

    def get_fields(self):
        fields = super().get_fields()
        view = self.context.get("view")
        if view and view.action != "list":
            fields.pop("autoridades_academicas", None)
        return fields

    def update(self, instance, validated_data):
        try:
            return InstitucionServicio.actualizar(instance, validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def validate(self, attrs):
        if self.partial and "codigo" not in attrs:
            raise serializers.ValidationError(
                {"codigo": ["Este campo es obligatorio."]}
            )
        return attrs

    def validate_nombre(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Este campo no puede estar en blanco.")
        return self._validate_unique("nombre", value, "institución con este nombre ya existe.")

    def validate_codigo(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Este campo no puede estar en blanco.")
        return self._validate_unique("codigo", value, "institución con este código ya existe.")

    def validate_ruc(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Este campo no puede estar en blanco.")
        return self._validate_unique("ruc", value, "institución con este ruc ya existe.")

    def _validate_unique(self, field, value, message):
        queryset = Institucion.objects.filter(**{field: value})
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError(message)
        return value

    @staticmethod
    def _raise_unique_race_validation(error):
        messages = {
            "codigo": "institución con este código ya existe.",
            "nombre": "institución con este nombre ya existe.",
            "ruc": "institución con este ruc ya existe.",
        }
        error_text = str(error).lower()
        for field, message in messages.items():
            if f"institucion.{field}" in error_text:
                raise serializers.ValidationError({field: [message]}) from error
        raise error
