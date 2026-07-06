# Plan de Implementación Técnica: Gestionar Instituciones Educativas y Autoridades Académicas

**Rama**: `002-gestionar-instituciones` | **Fecha**: 2026-05-11 | **Spec**: [spec.md](./spec.md)

---

## 1. Propósito técnico del plan

Definir la estrategia técnica para implementar la gestión de instituciones educativas y la asignación de autoridades académicas, garantizando consistencia con la constitución del proyecto y con la especificación funcional asociada.

---

## 2. Decisiones de diseño e implementación

**Ubicación**: `specs/002-gestionar-instituciones/research.md`

---

## 3. Componentes técnicos impactados

### Backend (Django)

**Base de referencia**: `siged/backend/apps/`

| Componente | Acción | Propósito |
|---|---|---|
| `organizacion/models.py` | Crear | Definir modelos Institucion, Rol, UsuarioRol |
| `organizacion/excepciones.py` | Crear | Definir excepciones personalizadas |
| `organizacion/apis/views.py` | Crear | Exponer endpoints de instituciones y asignaciones |
| `organizacion/apis/urls.py` | Crear | Registrar rutas de instituciones y asignaciones |
| `organizacion/apis/serializers/institucion_serializer.py` | Crear | Validar solicitudes y respuestas de instituciones |
| `organizacion/apis/serializers/usuariorol_serializer.py` | Crear | Validar solicitudes y respuestas de asignaciones |
| `organizacion/servicios/institucion_servicio.py` | Crear | Centralizar operaciones de instituciones |
| `organizacion/servicios/usuariorol_servicio.py` | Crear | Centralizar operaciones de asignaciones |
| `organizacion/daos/institucion_dao.py` | Crear | Encapsular acceso a datos institucionales |
| `organizacion/daos/usuariorol_dao.py` | Crear | Encapsular acceso a datos de asignaciones |
| `organizacion/permisos.py` | Crear | Restringir acceso según rol |
| `organizacion/tests.py` | Crear |  Verificar los flujos de gestión de instituciones educativas y asignación de autoridades académicas |


### Frontend (React)

**Base de referencia**: `siged/frontend/src/`

| Componente | Acción | Propósito |
|---|---|---|
| `features/instituciones/pages/InstitucionListPage.tsx` | Crear | Presentar la pantalla de gestión de instituciones educativas |
| `features/instituciones/components/InstitucionTable.tsx` | Crear | Mostrar la tabla de instituciones |
| `features/instituciones/components/InstitucionForm.tsx` | Crear | Gestionar el formulario de registro y edición de instituciones |
| `features/instituciones/components/AutoridadAcademicaModal.tsx` | Crear | Gestionar el modal de asignaciones de autoridades académicas de una institución (listar, crear, editar, activar y desactivar) |
| `features/instituciones/pages/MisInstitucionesPage.tsx` | Crear | Presentar la pantalla de mis instituciones |
| `features/instituciones/components/InstitucionCard.tsx` | Crear | Mostrar una institución en formato de tarjeta |
| `features/instituciones/services/institucionApi.ts` | Crear | Consumir la API de instituciones |
| `features/instituciones/services/usuarioRolApi.ts` | Crear | Consumir la API de asignaciones de autoridad académica |

---

## 4. Contratos e interfaces a implementar o modificar

**Ubicación**: `specs/002-gestionar-instituciones/contracts/institucion-contracts.md`

### 4.1 Endpoints de Instituciones

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/instituciones/` | Listar todas las instituciones (soporta paginación, ordenamiento y búsqueda por nombre) y por cada institución lista solo las asignaciones activas de autoridad académica | ADMINISTRADOR |
| GET | `/instituciones/{id}/` | Obtener detalle de una institución | ADMINISTRADOR o AUTORIDAD_ACADEMICA |
| POST | `/instituciones/` | Crear una nueva institución | ADMINISTRADOR |
| PATCH | `/instituciones/{id}/` | Actualizar una institución | ADMINISTRADOR |
| DELETE | `/instituciones/{id}/` | Eliminar una institución | ADMINISTRADOR |
| GET | `/instituciones/usuario/` | Listar todas las instituciones con asignaciones activas del usuario en sesión (sin duplicidad) | Usuario en sesión |

### 4.2 Endpoints de UsuarioRoles

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/usuarioroles/roles/` | Listar todas los roles con asignaciones activas del usuario en sesión (sin duplicidad)  |  Usuario en sesión |
| GET | `/usuarioroles/` | Listar asignaciones (opcionalmente por institución) | ADMINISTRADOR |
| POST | `/usuarioroles/` | Crear asignación de rol | ADMINISTRADOR |
| PATCH | `/usuarioroles/{id}/` | Actualizar asignación | ADMINISTRADOR |
| PATCH | `/usuarioroles/{id}/estado/` | Activar/desactivar | ADMINISTRADOR |
| DELETE | `/usuarioroles/{id}/` | Eliminar asignación | ADMINISTRADOR |

### 4.3 Endpoints de usuarios

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/usuarios/?activo=` | Retornar la lista de usuarios del sistema, opcionalmente filtrada por estado activo, para su uso en el flujo de creación o edición de la asignación de una autoridad académica a una institución. | ADMINISTRADOR |

Este endpoint deberá implementarse en la app `core`.

---
## 5. Interfaz de usuario y navegabilidad del frontend

Los prototipos de referencia son:

**Pantalla inicial autenticada posterior al inicio de sesión (Home)**  
El **menú lateral** muestra las siguientes opciones de navegación:

- **Menú principal**, opción habilitada para todos los roles; al hacer clic, redirige a la pantalla **Home**.
- **Instituciones**, habilitada para el rol `ADMINISTRADOR`
- **Mis instituciones**, habilitada para el rol `AUTORIDAD_ACADEMICA`

**Pantalla de gestión de instituciones educativas**  
La opción **Instituciones** del menú lateral dirige a la pantalla de gestión de instituciones educativas con sus autoridades académicas.

- Maquetación visual: `./docs/prototypes/stitch_management_institutions/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_management_institutions/code.html`

Lineamientos a cumplir:

- En la tabla de instituciones educativas, la columna **AUTORIDADES ACADÉMICAS** deberá presentar la lista completa de autoridades académicas activas asociadas a cada institución, conforme a la respuesta retornada por el backend.
- Cuando una asignación de autoridad académica sea creada, editada, activada, desactivada o eliminada desde el modal de gestión, la tabla principal de instituciones debe actualizar de forma inmediata la información mostrada en la columna **AUTORIDADES ACADÉMICAS**.

**Pantalla de mis instituciones**  
La opción **Mis instituciones** del menú lateral dirige a la pantalla de mis instituciones.

- Maquetación visual: `./docs/prototypes/stitch_my_institutions/screen.png`
- Prototipo en HTML: `./docs/prototypes/stitch_my_institutions/code.html`

---

## 6. Estrategias de verificación

### Pruebas unitarias
- Validación de datos de instituciones (nombre, código, RUC obligatorios y únicos)
- Validación de unicidad al editar (excluyendo el registro en edición) para Institucion
- Restricción de eliminación de instituciones con dependencias activas
- Búsqueda por nombre case-insensitive de instituciones
- Validación de asignación de autoridad académica (usuario obligatorio, rol obligatorio, institución obligatoria para rol AUTORIDAD_ACADEMICA)
- Validación de unicidad de asignación activa (misma combinación usuario+rol+institución)
- Activación y desactivación de asignaciones

### Pruebas funcionales
- Verificación de visualización de opciones de menú lateral según roles activos 
- Listado de instituciones con paginación; ordenamiento por nombre, código y RUC; y búsqueda por nombre
- Registro, edición y eliminación (con confirmación previa) de instituciones
- Verificación de unicidad de nombre, código y RUC al crear institución (duplicados deben retornar error)
- Listado, asignación, edición, activación/desactivación y eliminación de autoridad académica por institución
- Verificación de que en creación de asignación de autoridad académica solo se muestren usuarios activos (`?activo=true`)
- Verificación de que en la edición de una asignación de autoridad académica se muestren todos los usuarios
- Verificación de acceso restringido por institución

### Pruebas de interfaz (UI)
- Renderizado de opciones de menú según roles (Instituciones para ADMINISTRADOR, Mis instituciones para AUTORIDAD_ACADEMICA)
- Renderizado correcto de tabla de instituciones con paginación, ordenamiento por nombre, código y RUC, y columna AUTORIDADES ACADÉMICAS mostrando lista de autoridades activas con botón Gestionar
- Funcionamiento de modal de creación y edición de instituciones
- Funcionamiento de modal de gestión de asignaciones (listado, creación, edición, activación/desactivación, eliminación) con actualización inmediata de la columna AUTORIDADES ACADÉMICAS en la tabla principal
- Visualización de tarjetas en Mis instituciones para autoridades académicas

### Pruebas de integración
- Integración controlador (`views`) → servicio → DAO
- Integración frontend → API de instituciones y asignaciones

### Pruebas de autorización
- Acceso permitido para ADMINISTRADOR
- Acceso permitido para AUTORIDAD_ACADEMICA de la institución
- Acceso denegado para AUTORIDAD_ACADEMICA de otra institución
- Acceso denegado para usuario sin permisos
- Acceso denegado sin autenticación