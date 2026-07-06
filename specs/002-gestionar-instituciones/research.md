# Investigación: Gestión de Instituciones y Autoridades Académicas

**Feature**: 002-gestionar-instituciones  
**Fecha**: 2026-03-24  
**Última actualización**: 2026-05-11

---
## 2. Decisiones de diseño e implementación

### D1: Modelos registrados en el panel de administración

**Contexto**: Se requiere gestionar instituciones, roles y asignaciones desde el panel de administración.

**Decisión**: Los modelos `Institucion`, `Rol` y `UsuarioRol` deben registrarse en el panel de administración de Django.

**Rationale**:
- Permite la gestión de datos desde la interfaz administrativa de Django
- Facilita tareas de administración del sistema
- Aprovecha la funcionalidad nativa de Django Admin

---

### D2: Modelo Rol con valores predefinidos

**Contexto**: El sistema requiere roles predefinidos (ADMINISTRADOR, AUTORIDAD_ACADEMICA, etc.).

**Decisión**: Crear modelo `Rol` con campo `nombre` con choices en Django, donde los valores se definan como constantes de clase para evitar valores hardcodeados.

**Rationale**:
- Permite gestión futura de roles desde admin si se requiere
- Mantiene trazabilidad en BD
- Evita duplicación de lógica en código
- Las constantes de clase permiten reutilizar los valores en consultas, validaciones y reglas de negocio sin hardcodearlos

---

### D3: Constantes de Roles en frontend centralizadas

**Contexto**: El frontend debe referenciar roles del sistema en múltiples puntos (menú, permisos, lógica de UI).

**Decisión**: Los identificadores internos de los roles deben definirse como constantes en `frontend/src/config/app.ts` y reutilizarse en toda lógica del frontend que dependa del rol del usuario.

**Rationale**:
- Evita valores hardcodeados en componentes, servicios y hooks
- Centraliza la definición de roles para facilitar mantenimiento
- Consistencia con la convención de constantes globales del proyecto

---

### D4: Uso de `nombre_display` para mostrar el rol en pantalla

**Contexto**: Los roles tienen identificadores internos (códigos) que no son legibles para el usuario final.

**Decisión**: Cuando el rol de un usuario deba mostrarse en cualquier pantalla del sistema, se utilizará el campo `nombre_display` retornado por el backend, en lugar de su identificador interno.

**Rationale**:
- Presenta una denominación comprensible para el usuario
- Desacopla la representación visual del identificador interno
- El backend es la fuente de verdad para la denominación del rol

---

### D5: UsuarioRol con institución nullable

**Contexto**: RV-006 exige institución obligatoria para AUTORIDAD_ACADEMICA, pero otros roles pueden no necesitarla.

**Decisión**: Campo `institucion` nullable en `UsuarioRol`, con validación en serializer.

**Rationale**:
- Flexible para otros roles (DOCENTE, SECRETARIA, etc.) que pueden añadirse más adelante
- La validación específica para AUTORIDAD_ACADEMICA se hace en serializer (no a nivel de BD)
- Cumple con RV-006 sin limitar extensibilidad

---

### D6: Unicidad de asignación activa en UsuarioRol

**Contexto**: Un usuario no debe tener múltiples asignaciones activas del mismo rol en la misma institución (RI-005).

**Decisión**: Restricción única para la combinación `usuario + rol + institucion` con `es_activo=True` con validación en serializer.

**Rationale**:
- Mantiene integridad de asignaciones
- Evita conflictos de acceso por asignaciones duplicadas
- Permite conservar historial con asignaciones inactivas

---

### D7: Permisos por contexto institucional

**Contexto**: AUTORIDAD_ACADEMICA debe acceder solo a su institución asignada.

**Decisión**: Permiso personalizado que verifica asignación activa del usuario a la institución solicitada.

**Rationale**:
- Separa validación de autorización de la lógica de negocio
- Verifica tanto rol como asignación activa

---

### D8: Reutilización del mecanismo de autenticación existente (frontend)

**Contexto**: Todo endpoint protegido requiere autenticación mediante token.

**Decisión**: Toda funcionalidad que consuma endpoints protegidos DEBE reutilizar, sin modificaciones, el mismo mecanismo de autenticación definido en funcionalidades previas: recuperar el token desde `localStorage` y enviarlo en el header `Authorization: Token <token>`.

**Rationale**:
- Consistencia con la implementación de autenticación existente
- Evita duplicación de lógica de autenticación
- Centraliza el mecanismo de persistencia del token

---

### D9: Obtención de roles activos al iniciar sesión o recargar página

**Contexto**: El menú lateral debe mostrar opciones según los roles activos del usuario.

**Decisión**: Al iniciar sesión de forma exitosa o al recargar la página con sesión autenticada, el frontend debe invocar el endpoint `GET /usuarioroles/roles/` para obtener los roles activos del usuario y habilitar las opciones correspondientes en el menú lateral.

**Rationale**:
- Los roles activos determinan las opciones de navegación visibles
- Refresca los roles del usuario en cada carga de página
- Permite reaccionar a cambios de asignaciones sin reloguear

---

### D10: Búsqueda case-insensitive de instituciones

**Contexto**: RF-006 permite buscar instituciones por nombre.

**Decisión**: Búsqueda con `__icontains` en Django ORM.

**Rationale**:
- Case-insensitive por defecto con `__icontains`
- Coincidencia parcial (contiene, no solo exacta)
- Simple de implementar y entender

---

### D11: Unicidad en edición de institución

**Contexto**: Al editar una institución (PUT o PATCH), las validaciones de unicidad (nombre, código, RUC) no deben comparar contra el propio registro en edición.

**Decisión**: El serializer recibe la instancia actual del objeto para excluirla de las validaciones de unicidad.

**Rationale**:
- Evita falsos positivos de duplicidad al editar
- Las validaciones de unicidad deben comparar contra otros registros, no contra sí mismo
- Patrón estándar en Django REST Framework para actualizaciones

---

### D12: Eliminación protegida de institución

**Contexto**: No se debe eliminar una institución con asignaciones activas.

**Decisión**: Verificación en servicio antes de eliminar, verificando dependencias activas.

**Rationale**:
- Mantiene integridad referencial
- Permite eliminación si todas las asignaciones están inactivas
- Mensaje claro de conflicto (409)

---

### D13: Filtro de usuarios para la creación/edición de asignación de autoridad académica 

**Contexto**: Al asignar una autoridad académica, el selector de usuarios debe mostrar solo usuarios activos en creación, pero en edición debe incluir también al usuario actual aunque esté inactivo.

**Decisión**: El frontend consume `GET /usuarios/` con `?activo=true` en el flujo de creación y sin filtro en el flujo de edición.

**Rationale**:
- En creación solo tienen sentido los usuarios activos (un usuario inactivo no puede asumir un rol)
- En edición se necesita mostrar el usuario actualmente asignado para no perder la referencia visual, incluso si fue desactivado posteriormente
- El backend expone el filtro como opcional; el frontend decide según el contexto

---

### D14: Visualización de errores de validación del backend en formularios

**Contexto**: Los endpoints POST y PATCH retornan errores de validación en formato campo-mensaje.

**Decisión**: El frontend debe mostrar los errores de validación retornados por el backend en formato `{campo: ["mensaje1", "mensaje2"]}`, asociando cada mensaje al campo correspondiente del formulario. Los errores sin campo específico (`non_field_errors`) deben mostrarse como mensaje global del formulario.

**Rationale**:
- UX consistente: el error se muestra junto al campo que lo origina
- Aprovecha el formato estándar de errores de DRF
- Aplica a todos los formularios que consuman endpoints POST o PATCH

---

## Resumen

| Decisión | Alternativas descartadas | Rationale |
|---|---|---|---|
| D1: Modelos registrados en admin | No registrarlos | Gestión administrativa nativa de Django |
| D2: Modelo Rol con valores predefinidos | Hardcoded, ENUM en BD | Flexibilidad, trazabilidad, sin hardcoded |
| D3: Constantes de roles en frontend centralizadas | Valores hardcodeados | Mantenibilidad, evitar duplicación |
| D4: Uso de `nombre_display` para mostrar el rol | Identificador interno del rol | Legibilidad para el usuario |
| D5: UsuarioRol con institución nullable | Institución obligatoria siempre | Extensibilidad para otros roles |
| D6: Unicidad de asignación activa | Múltiples asignaciones activas permitidas | Integridad, evita conflictos de acceso |
| D7: Permisos por contexto institucional | Validación en vista | Reutilizable, separation of concerns |
| D8: Reutilización del mecanismo de autenticación | Implementar autenticación propia | Consistencia, evitar duplicación |
| D9: Obtener roles activos al iniciar sesión o recargar | No refrescar roles | Menú actualizado según roles activos |
| D10: Búsqueda case-insensitive | Búsqueda exacta | UX mejorada |
| D11: Unicidad en edición de institución | Validar sin excluir registro en edición | Evita falsos positivos de duplicidad |
| D12: Eliminación protegida de institución | Eliminación en cascada | Integridad referencial |
| D13: Filtro de usuarios activos por contexto | Siempre filtrar o nunca filtrar | UX: creación solo activos, edición incluye asignado |
| D14: Visualización de errores de validación del backend | Mostrar errores genéricos | UX: error asociado al campo correspondiente |
