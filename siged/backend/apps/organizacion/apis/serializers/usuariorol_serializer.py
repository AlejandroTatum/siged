from rest_framework import serializers

from apps.core.models import Usuario
from apps.organizacion.models import Institucion, Rol, UsuarioRol
from apps.organizacion.daos.usuariorol_dao import UsuarioRolDAO
from apps.organizacion.servicios.usuariorol_servicio import UsuarioRolServicio


class InstitucionResumenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institucion
        fields = ["id", "nombre"]


class RolSerializer(serializers.ModelSerializer):
    nombre_display = serializers.CharField(source="get_nombre_display", read_only=True)

    class Meta:
        model = Rol
        fields = ["id", "nombre", "nombre_display"]


class UsuarioResumenSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="numero_identificacion")

    class Meta:
        model = Usuario
        fields = ["id", "username", "first_name", "last_name"]


class UsuarioRolSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsuarioRol
        fields = ["id", "usuario", "rol", "institucion", "es_activo", "fecha_desde", "fecha_hasta"]
        read_only_fields = ["es_activo", "fecha_desde", "fecha_hasta"]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["usuario"] = UsuarioResumenSerializer(instance.usuario).data
        data["rol"] = RolSerializer(instance.rol).data
        data["institucion"] = InstitucionResumenSerializer(instance.institucion).data if instance.institucion else None
        return data

    def create(self, validated_data):
        return UsuarioRolServicio.crear(validated_data)

    def update(self, instance, validated_data):
        return UsuarioRolServicio.actualizar(instance, validated_data)

    def validate(self, attrs):
        instance = self.instance
        usuario = attrs.get("usuario", getattr(instance, "usuario", None))
        rol = attrs.get("rol", getattr(instance, "rol", None))
        institucion = attrs.get("institucion", getattr(instance, "institucion", None))
        if rol and rol.nombre == Rol.AUTORIDAD_ACADEMICA and institucion is None:
            raise serializers.ValidationError({"institucion": ["Este campo es obligatorio para el rol AUTORIDAD_ACADEMICA."]})
        es_activo = getattr(instance, "es_activo", True)
        if es_activo and UsuarioRolDAO.existe_activa(usuario, rol, institucion, instance.pk if instance else None):
            raise serializers.ValidationError("Ya existe una asignación activa para este usuario, rol e institución.")
        return attrs
