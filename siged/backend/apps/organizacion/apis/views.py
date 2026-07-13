from rest_framework import serializers, status, viewsets
from rest_framework.decorators import action
from django.http import Http404
from rest_framework.exceptions import NotAuthenticated, NotFound, PermissionDenied, ValidationError
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.organizacion.apis.serializers.institucion_serializer import InstitucionSerializer
from apps.organizacion.apis.serializers.usuariorol_serializer import RolSerializer, UsuarioRolSerializer
from apps.organizacion.apis.serializers.rol_serializer import RolCatalogoSerializer
from apps.organizacion.excepciones import InstitucionConAsignacionesActivas
from apps.organizacion.models import Institucion, Rol, UsuarioRol
from apps.organizacion.permisos import EsAdministradorActivo, PuedeVerInstitucion
from apps.organizacion.servicios.institucion_servicio import InstitucionServicio
from apps.organizacion.servicios.usuariorol_servicio import UsuarioRolServicio
from apps.organizacion.servicios.rol_servicio import RolServicio


class InstitucionPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_page_size(self, request):
        raw = request.query_params.get(self.page_size_query_param)
        if raw is not None:
            try:
                if int(raw) < 1:
                    raise ValueError
            except ValueError:
                raise ValidationError({"detail": "page_size must be a positive integer."})
        return super().get_page_size(request)


class InstitucionViewSet(viewsets.ModelViewSet):
    permission_classes = [EsAdministradorActivo]
    serializer_class = InstitucionSerializer
    pagination_class = InstitucionPagination

    def get_permissions(self):
        if self.action == "usuario":
            permission = IsAuthenticated
        else:
            permission = PuedeVerInstitucion if self.action == "retrieve" else EsAdministradorActivo
        return [permission()]

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise NotFound("No encontrado.")

    def permission_denied(self, request, message=None, code=None):
        if not request.successful_authenticator:
            raise NotAuthenticated("Las credenciales de autenticación no se proporcionaron.")
        raise PermissionDenied("No tiene permisos para realizar esta acción.")

    def get_queryset(self):
        ordering = self.request.query_params.get("ordering", "nombre")
        if ordering.lstrip("-") not in {"nombre", "codigo", "ruc"}:
            raise ValidationError({"detail": "Unsupported ordering field."})
        page = self.request.query_params.get("page")
        if page is not None:
            try:
                if int(page) < 1:
                    raise ValueError
            except ValueError:
                raise ValidationError({"detail": "page must be a positive integer."})
        return InstitucionServicio.listar(self.request.query_params.get("nombre", ""), ordering)

    def destroy(self, request, *args, **kwargs):
        try:
            InstitucionServicio.eliminar(kwargs["pk"])
        except Institucion.DoesNotExist:
            return Response({"detail": "No encontrado."}, status=status.HTTP_404_NOT_FOUND)
        except InstitucionConAsignacionesActivas:
            return Response(
                {"error": "No se puede eliminar la institución porque tiene autoridades académicas activas."},
                status=status.HTTP_409_CONFLICT,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def usuario(self, request):
        queryset = InstitucionServicio.listar_por_usuario(request.user)
        return Response(InstitucionSerializer(queryset, many=True).data)


class RolViewSet(viewsets.ReadOnlyModelViewSet):
    http_method_names = ["get", "head", "options"]
    permission_classes = [EsAdministradorActivo]
    serializer_class = RolCatalogoSerializer

    def get_queryset(self):
        return RolServicio.listar()


class UsuarioRolViewSet(viewsets.ModelViewSet):
    permission_classes = [EsAdministradorActivo]
    serializer_class = UsuarioRolSerializer

    def get_queryset(self):
        return UsuarioRolServicio.listar(self.request.query_params.get("institucion"))

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def roles(self, request):
        return Response(RolSerializer(UsuarioRolServicio.roles_activos(request.user), many=True).data)

    @action(detail=True, methods=["patch"])
    def estado(self, request, pk=None):
        assignment = self.get_object()
        serializer = serializers.Serializer(data=request.data)
        serializer.fields["es_activo"] = serializers.BooleanField(required=True)
        serializer.is_valid(raise_exception=True)
        UsuarioRolServicio.cambiar_estado(assignment, serializer.validated_data["es_activo"])
        return Response(self.get_serializer(assignment).data)

    def perform_destroy(self, instance):
        UsuarioRolServicio.eliminar(instance)
