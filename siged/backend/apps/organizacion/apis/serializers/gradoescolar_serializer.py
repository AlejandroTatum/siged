from django.db import IntegrityError
from django.db.models import Sum
from rest_framework import serializers

from apps.organizacion.daos.gradoescolar_dao import GradoEscolarDAO
from apps.organizacion.models import EducacionNivel, EducacionSubnivel, GradoEscolar, PlanEstudio
from apps.organizacion.servicios.gradoescolar_servicio import GradoEscolarServicio


class GradoEscolarSerializer(serializers.ModelSerializer):
    alerta_carga_pedagogica = serializers.BooleanField(read_only=True)
    carga_pedagogica_actual = serializers.IntegerField(read_only=True)
    carga_pedagogica_minima = serializers.IntegerField(read_only=True)
    nivel = serializers.PrimaryKeyRelatedField(
        queryset=EducacionNivel.objects.all(),
        error_messages={"required": "Este campo es obligatorio."},
    )
    nombre = serializers.CharField(
        max_length=100, error_messages={"required": "Este campo es obligatorio."}
    )
    orden = serializers.IntegerField(
        min_value=1, error_messages={"required": "Este campo es obligatorio."}
    )
    plan_estudio = serializers.PrimaryKeyRelatedField(
        queryset=PlanEstudio.objects.all(),
        error_messages={"required": "Este campo es obligatorio."},
    )
    subnivel = serializers.PrimaryKeyRelatedField(
        allow_null=True, queryset=EducacionSubnivel.objects.all(), required=False
    )

    class Meta:
        model = GradoEscolar
        fields = [
            "id", "nombre", "orden", "plan_estudio", "nivel", "subnivel",
            "alerta_carga_pedagogica", "carga_pedagogica_actual",
            "carga_pedagogica_minima", "fecha_creacion", "fecha_actualizacion",
        ]
        read_only_fields = [
            "alerta_carga_pedagogica", "carga_pedagogica_actual",
            "carga_pedagogica_minima", "fecha_creacion", "fecha_actualizacion",
        ]
        validators = []

    def create(self, validated_data):
        try:
            return GradoEscolarServicio.crear(validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        detail = getattr(self.context.get("view"), "action", None) == "retrieve"
        representation["nivel"] = {
            "id": instance.nivel_id,
            "nombre": instance.nivel.nombre,
        }
        if detail:
            representation["nivel"].update({
                "pp_minutos": instance.nivel.pp_minutos,
                "pp_semana_minimo": instance.nivel.pp_semana_minimo,
            })
            representation["plan_estudio"] = {
                "id": instance.plan_estudio_id,
                "nombre": instance.plan_estudio.nombre,
            }
        representation["subnivel"] = (
            {"id": instance.subnivel_id, "nombre": instance.subnivel.nombre}
            if instance.subnivel_id else None
        )
        current = getattr(instance, "carga_pedagogica_actual", None)
        if current is None:
            current = instance.asignaturas.aggregate(total=Sum("pp_semana_minimo"))["total"] or 0
        minimum = (
            instance.subnivel.pp_semana_minimo
            if instance.subnivel_id else instance.nivel.pp_semana_minimo
        )
        representation["carga_pedagogica_actual"] = current
        representation["carga_pedagogica_minima"] = minimum
        representation["alerta_carga_pedagogica"] = current < minimum
        return representation

    def update(self, instance, validated_data):
        validated_data.pop("plan_estudio", None)
        try:
            return GradoEscolarServicio.actualizar(instance, validated_data)
        except IntegrityError as error:
            self._raise_unique_race_validation(error)

    def validate(self, attrs):
        plan = attrs.get("plan_estudio") or getattr(self.instance, "plan_estudio", None)
        level = attrs.get("nivel") or getattr(self.instance, "nivel", None)
        sublevel = attrs.get("subnivel", getattr(self.instance, "subnivel", None))
        nombre = attrs.get("nombre", getattr(self.instance, "nombre", None))
        if level:
            if sublevel and sublevel.educacion_nivel_id != level.pk:
                raise serializers.ValidationError({
                    "subnivel": ["El subnivel debe pertenecer al nivel seleccionado."]
                })
            if not sublevel and level.subniveles.exists():
                raise serializers.ValidationError({
                    "subnivel": ["Este campo es obligatorio para el nivel seleccionado."]
                })
        if plan and nombre and GradoEscolarDAO.existe_nombre(
            plan.pk, nombre, excluir_pk=getattr(self.instance, "pk", None)
        ):
            raise serializers.ValidationError({
                "nombre": ["grado escolar con este nombre ya existe en este plan de estudio."]
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
        if "grado_nombre_por_plan_uniq" in text or (
            "gradoescolar.plan_estudio_id" in text and "gradoescolar.nombre" in text
        ):
            raise serializers.ValidationError({
                "nombre": ["grado escolar con este nombre ya existe en este plan de estudio."]
            }) from error
        raise error
