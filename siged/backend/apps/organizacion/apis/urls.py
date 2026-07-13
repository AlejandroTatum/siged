from rest_framework.routers import DefaultRouter

from apps.organizacion.apis.views import InstitucionViewSet, RolViewSet, UsuarioRolViewSet

router = DefaultRouter()
router.register("instituciones", InstitucionViewSet, basename="institucion")
router.register("roles", RolViewSet, basename="rol")
router.register("usuarioroles", UsuarioRolViewSet, basename="usuariorol")
urlpatterns = router.urls
