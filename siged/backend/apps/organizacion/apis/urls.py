from rest_framework.routers import DefaultRouter

from apps.organizacion.apis.views import (
    AsignaturaViewSet, EducacionNivelViewSet, GradoEscolarViewSet,
    InstitucionViewSet, PlanEstudioViewSet, RolViewSet, UsuarioRolViewSet
)

router = DefaultRouter()
router.register("asignaturas", AsignaturaViewSet, basename="asignatura")
router.register("educacion-niveles", EducacionNivelViewSet, basename="educacion-nivel")
router.register("grados-escolares", GradoEscolarViewSet, basename="grado-escolar")
router.register("instituciones", InstitucionViewSet, basename="institucion")
router.register("planes-estudio", PlanEstudioViewSet, basename="plan-estudio")
router.register("roles", RolViewSet, basename="rol")
router.register("usuarioroles", UsuarioRolViewSet, basename="usuariorol")
urlpatterns = router.urls
