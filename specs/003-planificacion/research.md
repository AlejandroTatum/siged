# Investigación: Gestión de Planificación Curricular

**Feature**: 003-planificacion  
**Fecha**: 2026-05-11

---

## 2. Decisiones de diseño e implementación

### D1: Catálogos, modelos y registro en el panel de administración

**Contexto**: Todos los modelos de la feature (`EducacionNivel`, `EducacionSubNivel`, `PlanEstudio`, `GradoEscolar`, `Asignatura`) deben gestionarse desde el panel de administración de Django.

**Decisión**: 
- Implementar los modelos `EducacionNivel`, `EducacionSubNivel`, `PlanEstudio`, `GradoEscolar` y `Asignatura` en `organizacion/models.py`.
- Registrar los cinco modelos en el admin de Django para permitir gestión CRUD desde el panel de administración.
- Endpoint de lectura: Exponer `GET /educacion-niveles/` que retorna niveles con sus subniveles anidados.

**Rationale**: Los catálogos y modelos se gestionan directamente desde el admin de Django (no requiere seeds/migrations). Un solo endpoint con subniveles anidados simplifica el consumo desde el frontend.

---

### D2: Reutilización del mecanismo de autenticación existente (frontend)

**Contexto**: Todo endpoint protegido requiere autenticación mediante token.

**Decisión**: Toda funcionalidad que consuma endpoints protegidos DEBE reutilizar, sin modificaciones, el mismo mecanismo de autenticación definido en funcionalidades previas: recuperar el token desde `localStorage` y enviarlo en el header `Authorization: Token <token>`.

**Rationale**:
- Consistencia con la implementación de autenticación existente
- Evita duplicación de lógica de autenticación
- Centraliza el mecanismo de persistencia del token

---

### D3: Permisos por Contexto Institucional

**Contexto**: La autoridad académica debe acceder únicamente a la planificación curricular de la institución que le ha sido asignada, según el contexto institucional definido en 002-gestionar-instituciones.

**Decisión**: Implementar permiso personalizado en `organizacion/permisos.py` que verifique:
1. El usuario tiene rol AUTORIDAD_ACADEMICA
2. Existe una asignación activa para la institución solicitada

**Rationale**: Patrón ya implementado en 002-gestionar-instituciones; garantiza consistencia arquitectónica.

---

### D4: Búsqueda case-insensitive para planes y grados

**Contexto**: RF-003 y RF-009 requieren búsqueda por nombre de planes de estudio y grados escolares.

**Decisión**: Búsqueda con `__icontains` en Django ORM para `PlanEstudio` y `GradoEscolar`.

**Rationale**:
- Case-insensitive por defecto con `__icontains`
- Coincidencia parcial (contiene, no solo exacta)
- Simple de implementar y entender
- Consistencia con la decisión D4 de 002-gestionar-instituciones

---

### D5: Unicidad en edición de entidades

**Contexto**: Al editar un `PlanEstudio`, `GradoEscolar` o `Asignatura` (PUT o PATCH), las validaciones de unicidad no deben comparar el registro contra sus propios valores almacenados.

**Decisión**: El serializer recibe la instancia actual del objeto para excluirla de las validaciones de unicidad, siguiendo el patrón definido en 002-gestionar-instituciones.

**Rationale**:
- Evita falsos positivos de duplicidad al editar
- Aplica a las tres entidades principales de la feature
- Patrón estándar en Django REST Framework para actualizaciones

---

### D6: Validación de Plan Vigente Único

**Contexto**: RF-007 requiere garantizar un solo plan vigente por institución.

**Decisión**: Validar en `PlanEstudioServicio.crear()` y `actualizar()`, verificando que no exista otro plan con `es_activo=True` para la misma institución antes de guardar.

**Rationale**: Reutiliza lógica tanto en creación como en actualización; mantiene consistencia con el patrón de validación en servicio.

---

### D7: Validación de Carga Pedagógica

**Contexto**: RF-017 requiere mostrar alerta cuando la suma de períodos de asignaturas sea menor al mínimo del nivel/subnivel en el grado escolar.

**Decisión**: Implementar la validación en `GradoEscolarServicio`, calculando la suma de `pp_semana_minimo` de todas las asignaturas vinculadas y comparándola contra el valor del subnivel (o nivel si no existe subnivel).

**Rationale**: Encapsula la lógica de negocio en el servicio, facilitando pruebas unitarias y modificaciones futuras.

---

### D8: Visualización de errores de validación del backend en formularios

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
| D1: Catálogos, modelos y registro en admin | Seeds/migrations manuales | Gestión CRUD nativa desde admin |
| D2: Reutilización del mecanismo de autenticación | Implementar autenticación propia | Consistencia, evitar duplicación |
| D3: Permisos por contexto institucional | Validación en vista | Reutilizable, separation of concerns |
| D4: Búsqueda case-insensitive | Búsqueda exacta | UX mejorada, consistencia con 002 |
| D5: Unicidad en edición | Validar sin excluir registro en edición | Evita falsos positivos de duplicidad |
| D6: Plan vigente único | Sin validación, múltiples vigentes | Consistencia RF-007 |
| D7: Validación carga pedagógica | Validación en serializer o vista | Encapsulada en servicio, testeable |
| D8: Visualización de errores de validación del backend | Mostrar errores genéricos | UX: error asociado al campo correspondiente |
