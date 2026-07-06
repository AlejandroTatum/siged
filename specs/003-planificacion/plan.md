# Plan de Implementación Técnica: Gestión de Planificación Curricular

**Rama**: `003-planificacion` | **Fecha**: 2026-05-11 | **Spec**: [spec.md](./spec.md)

---

## 1. Propósito técnico del plan

Definir la estrategia técnica para implementar la gestión de planes de estudio, grados escolares y asignaturas por institución educativa, garantizando consistencia con la constitución del proyecto y con la especificación funcional asociada.

---

## 2. Decisiones de diseño e implementación

**Ubicación**: `specs/003-planificacion/research.md`

---

## 3. Componentes técnicos impactados

### Backend (Django)

**Base de referencia**: `siged/backend/apps/`

| Componente | Acción | Propósito |
|---|---|---|
| `organizacion/models.py` | Modificar | Definir modelos PlanEstudio, GradoEscolar, Asignatura, EducacionNivel, EducacionSubNivel |
| `organizacion/excepciones.py` | Crear o modificar | Definir excepciones personalizadas |
| `organizacion/apis/views.py` | Modificar | Exponer endpoints de niveles, subniveles, planes, grados y asignaturas |
| `organizacion/apis/urls.py` | Modificar | Registrar rutas de planificación curricular |
| `organizacion/apis/serializers/planestudio_serializer.py` | Crear | Validar solicitudes y respuestas de planes de estudio |
| `organizacion/apis/serializers/gradoescolar_serializer.py` | Crear | Validar solicitudes y respuestas de grados escolares |
| `organizacion/apis/serializers/asignatura_serializer.py` | Crear | Validar solicitudes y respuestas de asignaturas |
| `organizacion/apis/serializers/educacionnivel_serializer.py` | Crear | Validar solicitudes y respuestas de niveles educativos |
| `organizacion/apis/serializers/educacionsubnivel_serializer.py` | Crear | Validar solicitudes y respuestas de subniveles educativos |
| `organizacion/servicios/planestudio_servicio.py` | Crear | Centralizar operaciones de planes de estudio |
| `organizacion/servicios/gradoescolar_servicio.py` | Crear | Centralizar operaciones de grados escolares |
| `organizacion/servicios/asignatura_servicio.py` | Crear | Centralizar operaciones de asignaturas |
| `organizacion/daos/planestudio_dao.py` | Crear | Encapsular acceso a datos de planes de estudio |
| `organizacion/daos/gradoescolar_dao.py` | Crear | Encapsular acceso a datos de grados escolares |
| `organizacion/daos/asignatura_dao.py` | Crear | Encapsular acceso a datos de asignaturas |
| `organizacion/permisos.py` | Crear o modificar | Restringir acceso según rol y contexto institucional |
| `organizacion/tests.py` | Crear o modificar | Verificar CRUD, validaciones y restricciones |


### Frontend (React)

**Base de referencia**: `siged/frontend/src/`

| Componente | Acción | Propósito |
|---|---|---|
| `features/planificacion/pages/DashboardPage.tsx` | Crear | Presentar el dashboard institucional con información de la institución seleccionada |
| `features/planificacion/pages/PlanEstudioListPage.tsx` | Crear | Presentar el listado de planes de estudio |
| `features/planificacion/components/PlanEstudioTable.tsx` | Crear | Mostrar la tabla de planes de estudio |
| `features/planificacion/components/PlanEstudioForm.tsx` | Crear | Gestionar el formulario de registro y edición de planes de estudio |
| `features/planificacion/pages/GradoAsignaturaPage.tsx` | Crear | Presentar la vista integrada de grados escolares y sus asignaturas |
| `features/planificacion/components/GradoEscolarTable.tsx` | Crear | Mostrar la tabla de grados escolares |
| `features/planificacion/components/GradoEscolarForm.tsx` | Crear | Gestionar el formulario de registro y edición de grados escolares |
| `features/planificacion/components/AsignaturaCard.tsx` | Crear | Mostrar una asignatura en formato de tarjeta |
| `features/planificacion/components/AsignaturaSection.tsx` | Crear | Presentar la sección de asignaturas vinculadas de un grado escolar |
| `features/planificacion/services/planEstudioApi.ts` | Crear | Consumir la API de planes de estudio |
| `features/planificacion/services/gradoEscolarApi.ts` | Crear | Consumir la API de grados escolares |
| `features/planificacion/services/asignaturaApi.ts` | Crear | Consumir la API de asignaturas |
| `features/planificacion/services/nivelApi.ts` | Crear | Consumir la API de niveles y subniveles educativos |

---

## 4. Contratos e interfaces a implementar o modificar

**Ubicación**: `specs/003-planificacion/contracts/planificacion-contracts.md`

### 4.1 Endpoints de Planes de Estudio

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/planes-estudio/instituciones/{id}/` | Listar planes de estudio (soporta paginación, ordenamiento y búsqueda por nombre) de una institución educativa identificada por {id} | AUTORIDAD_ACADEMICA (solo su institución) |
| GET | `/planes-estudio/{id}/` | Obtener detalle de un plan de estudio | AUTORIDAD_ACADEMICA |
| POST | `/planes-estudio/` | Crear un nuevo plan de estudio (**enviar institucion en body**) | AUTORIDAD_ACADEMICA |
| PATCH | `/planes-estudio/{id}/` | Actualizar un plan de estudio | AUTORIDAD_ACADEMICA |
| DELETE | `/planes-estudio/{id}/` | Eliminar un plan de estudio | AUTORIDAD_ACADEMICA |

### 4.2 Endpoints de Grados Escolares

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/grados-escolares/planes-estudio/{id}/` | Listar grados escolares (soporta paginación, ordenamiento y búsqueda por nombre) de un plan de estudio identificada por {id}| AUTORIDAD_ACADEMICA |
| GET | `/grados-escolares/{id}/` | Obtener detalle de un grado escolar | AUTORIDAD_ACADEMICA |
| POST | `/grados-escolares/` | Crear un nuevo grado escolar (**enviar plan_estudio en body**) | AUTORIDAD_ACADEMICA |
| PATCH | `/grados-escolares/{id}/` | Actualizar un grado escolar | AUTORIDAD_ACADEMICA |
| DELETE | `/grados-escolares/{id}/` | Eliminar un grado escolar | AUTORIDAD_ACADEMICA |

### 4.3 Endpoints de Asignaturas

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/asignaturas/grados-escolares/{id}/` | Listar asignaturas de un grado escolar identificada por {id} | AUTORIDAD_ACADEMICA |
| GET | `/asignaturas/{id}/` | Obtener detalle de una asignatura | AUTORIDAD_ACADEMICA |
| POST | `/asignaturas/` | Crear una nueva asignatura (**enviar grado_escolar en body**) | AUTORIDAD_ACADEMICA |
| PATCH | `/asignaturas/{id}/` | Actualizar una asignatura | AUTORIDAD_ACADEMICA |
| DELETE | `/asignaturas/{id}/` | Eliminar una asignatura | AUTORIDAD_ACADEMICA |

### 4.4 Endpoints de Catálogo (solo lectura)

| Método | Endpoint | Descripción | Autorización |
|--------|----------|-------------|--------------|
| GET | `/educacion-niveles/` | Listar niveles educativos con sus subniveles |  Usuario en sesión |

---
## 5. Interfaz de usuario y navegabilidad del frontend

Los prototipos de referencia son:

**Dashboard institucional**  
Desde la pantalla **Mis instituciones**, la **autoridad académica** navega al dashboard institucional de una institución educativa mediante la acción **Ingresar** disponible en cada registro. 

- Maquetación visual: `specs/003-planificacion/docs/prototypes/stitch_dashboard_my_institution/screen.png`
- Prototipo en html: `specs/003-planificacion/docs/prototypes/stitch_dashboard_my_institution/code.html`

Lineamientos a cumplir:

- Al desplegarse el **menú contextual institucional**, se debe mostrar únicamente las opciones:
    - **Volver al menú principal** debe retornar al menú lateral del contexto general del sistema.
    - **Mi institución** debe dirigir al dashboard institucional de la entidad seleccionada.
    - **Planes de estudio** debe dirigir a la vista de gestión de planes de estudio correspondiente a la institución seleccionada.

**Pantalla de gestión de planes de estudio**  
Desde el dashboard institucional, la **autoridad académica** puede acceder a la vista de gestión de planes de estudio de la institución seleccionada.

- Maquetación visual: `specs/003-planificacion/docs/prototypes/stitch_study_plans/screen.png`
- Prototipo en html: `specs/003-planificacion/docs/prototypes/stitch_study_plans/code.html`

**Pantalla de gestión de grados escolares y asignaturas**  
Desde la pantalla de gestión de planes de estudio, la **autoridad académica** puede acceder a la vista de gestión de grados escolares y asignaturas correspondiente al plan de estudio seleccionado.

- Maquetación visual: `specs/003-planificacion/docs/prototypes/stitch_degrees_subjects/screen.png`
- Prototipo en html: `specs/003-planificacion/docs/prototypes/stitch_degrees_subjects/code.html`

Lineamientos a cumplir:

- En el formulario de creación de un grado escolar, el campo **nivel** debe presentar la opción **“Seleccione el nivel”** como valor inicial. Asimismo, el campo **subnivel** deberá ser obligatorio cuando el nivel seleccionado contemple subniveles, y deberá presentar la opción **“Seleccione un subnivel”** como valor inicial.
- En el formulario de edición de un grado escolar, cuando el registro tenga un **subnivel** previamente asignado, este deberá mostrarse seleccionado automáticamente al cargar la información.
- La **carga pedagógica** de cada grado escolar debe mostrase en el formato (actual/mínimo pp). Adicionalmente, cuando sea inferior a la carga mínima requerida, deberá presentarse la etiqueta **“Alerta”**.
- Cuando **creo, edito o elimino** una asignatura se debe actualizar la “Alerta” de carga pedagógica en la tabla de Grados escolares.

---
## 6. Estrategias de verificación

### Pruebas unitarias
- Validación de datos de planes de estudio (nombre obligatorio, es_activo booleano, institución obligatoria)
- Validación de datos de grados escolares (nombre obligatorio, orden positivo, plan_estudio obligatorio, nivel obligatorio)
- Validación de datos de asignaturas (nombre obligatorio, pp_semana_minimo positivo, grado_escolar obligatorio)
- Validación de unicidad de plan vigente por institución
- Validación de subnivel obligatorio cuando nivel lo requiera
- Validación de unicidad de nombre por contexto en creación (plan único por institución, grado único por plan de estudio, asignatura única por grado escolar)
- Validación de unicidad al editar (excluyendo el registro en edición) para PlanEstudio, GradoEscolar y Asignatura
- Búsqueda por nombre case-insensitive de planes de estudio
- Búsqueda por nombre case-insensitive de grados escolares

### Pruebas funcionales
- Verificación de acceso restringido por institución (solo AUTORIDAD_ACADEMICA asignada)
- Listado de planes de estudio con paginación; ordenamiento por nombre y estado; y búsqueda por nombre
- Registro, edición y eliminación (con confirmación previa) de planes de estudio
- Verificación de unicidad de nombre de plan de estudio por institución (crear plan con nombre duplicado debe retornar error)
- Verificación de eliminación protegida de plan de estudio (no se debe poder eliminar un plan con grados escolares asociados)
- Listado de grados escolares con paginación; ordenamiento por nombre, orden, nivel y subnivel; y búsqueda por nombre
- Registro, edición y eliminación (con confirmación previa) de grados escolares
- Verificación de unicidad de nombre de grado escolar por plan de estudio (crear grado con nombre duplicado en el mismo plan debe retornar error)
- Verificación de subnivel obligatorio al crear o editar un grado con nivel que tiene subniveles definidos
- Verificación de eliminación protegida de grado escolar (no se debe poder eliminar un grado con asignaturas asociadas)
- Listado, registro, edición y eliminación (con confirmación previa) de asignaturas de un grado escolar con actualización inmediata de la alerta de carga pedagógica en la tabla de grados escolares
- Verificación de unicidad de nombre de asignatura por grado escolar (crear asignatura con nombre duplicado en el mismo grado debe retornar error)
- Verificación de alerta de carga pedagógica cuando la suma de períodos pedagógicos de las asignaturas sea inferior al mínimo requerido según el subnivel (o nivel si no existe subnivel).

### Pruebas de interfaz (UI)
- Renderizado correcto del menú contextual institucional con opciones Volver al menú principal, Mi institución y Planes de estudio
- Renderizado correcto del dashboard institucional con nombre de la institución seleccionada
- Renderizado de la tabla de Planes de Estudio con paginación, ordenamiento por nombre y estado, y funcionalidad de búsqueda por nombre
- En la tabla de Planes de Estudio, cada plan debe contar con una acción para navegar hacia la gestión de grados escolares y asignaturas
- Funcionamiento de modales para creación y edición de Planes de Estudio
- Renderizado de la tabla de Grados Escolares con paginación, ordenamiento por nombre, orden, nivel y subnivel, búsqueda por nombre y alerta de carga pedagógica
- Funcionamiento de modales para creación y edición de Grados Escolares, con validación de nivel obligatorio y subnivel cuando aplique
- Renderizado del panel de Asignaturas vinculadas a un grado escolar, con modales para creación y edición de asignaturas
- Actualización de la alerta de carga pedagógica en la tabla de grados escolares al crear, editar o eliminar asignaturas
- Visualización y funcionamiento de diálogos de confirmación para eliminación de planes, grados y asignaturas
- Navegación correcta: Mis instituciones → Ingresar → Dashboard institucional → Planes de estudio → Grados escolares y asignaturas

### Pruebas de integración
- Integración controlador → servicio → DAO
- Integración frontend → API de planificación curricular

### Pruebas de autorización
- Acceso permitido para AUTORIDAD_ACADEMICA de la institución
- Acceso denegado para AUTORIDAD_ACADEMICA de otra institución
- Acceso denegado para usuario sin permisos
- Acceso denegado sin autenticación
