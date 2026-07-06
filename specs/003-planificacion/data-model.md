# Modelo de Datos: Gestión de Planificación Curricular

**Feature**: 003-planificacion  
**Fecha**: 2026-05-11

---

## 1. Entidades del Dominio

### PlanEstudio

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único | Autogenerado, clave primaria |
| `nombre` | `CharField(200)` | Nombre del plan de estudio | Obligatorio, único por institución, máximo 200 caracteres |
| `es_activo` | `BooleanField` | Indica si es el plan vigente | Obligatorio, valor por defecto `False` |
| `institucion` | `ForeignKey(Institucion)` | Institución educativa | Obligatorio |
| `fecha_creacion` | `DateTimeField` | Fecha de creación | Autogenerado |
| `fecha_actualizacion` | `DateTimeField` | Fecha de última actualización | Nullable, autogestionado |

---

### EducacionNivel

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único | Autogenerado, clave primaria |
| `nombre` | `CharField(100)` | Nombre del nivel educativo | Obligatorio, único, máximo 100 caracteres |
| `pp_minutos` | `PositiveIntegerField` | Minutos por período pedagógico | Obligatorio, valor positivo |
| `pp_semana_minimo` | `PositiveIntegerField` | Períodos pedagógicos mínimos semanales | Obligatorio, valor positivo |
| `fecha_creacion` | `DateTimeField` | Fecha de creación | Autogenerado |
| `fecha_actualizacion` | `DateTimeField` | Fecha de última actualización | Nullable, autogestionado |

**Observaciones**: Este modelo es un catálogo gestionado desde el panel de administración de Django.

---

### EducacionSubNivel

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único | Autogenerado, clave primaria |
| `nombre` | `CharField(100)` | Nombre del subnivel educativo | Obligatorio, máximo 100 caracteres |
| `pp_semana_minimo` | `PositiveIntegerField` | Períodos pedagógicos mínimos semanales | Obligatorio, valor positivo |
| `educacion_nivel` | `ForeignKey(EducacionNivel)` | Nivel educativo padre | Obligatorio |
| `fecha_creacion` | `DateTimeField` | Fecha de creación | Autogenerado |
| `fecha_actualizacion` | `DateTimeField` | Fecha de última actualización | Nullable, autogestionado |

**Observaciones**: Este modelo es un catálogo gestionado desde el panel de administración de Django.

---

### GradoEscolar

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único | Autogenerado, clave primaria |
| `nombre` | `CharField(100)` | Nombre del grado escolar | Obligatorio, único por plan de estudio, máximo 100 caracteres |
| `orden` | `PositiveIntegerField` | Orden del grado en el plan | Obligatorio, valor positivo |
| `plan_estudio` | `ForeignKey(PlanEstudio)` | Plan de estudio al que pertenece | Obligatorio |
| `nivel` | `ForeignKey(EducacionNivel)` | Nivel educativo asociado | Obligatorio |
| `subnivel` | `ForeignKey(EducacionSubNivel)` | Subnivel educativo asociado | Opcional |
| `fecha_creacion` | `DateTimeField` | Fecha de creación | Autogenerado |
| `fecha_actualizacion` | `DateTimeField` | Fecha de última actualización | Nullable, autogestionado |

---

### Asignatura

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único | Autogenerado, clave primaria |
| `nombre` | `CharField(150)` | Nombre de la asignatura | Obligatorio, único por grado escolar, máximo 150 caracteres |
| `pp_semana_minimo` | `PositiveIntegerField` | Períodos pedagógicos mínimos semanales | Obligatorio, valor positivo |
| `grado_escolar` | `ForeignKey(GradoEscolar)` | Grado escolar al que pertenece | Obligatorio |
| `fecha_creacion` | `DateTimeField` | Fecha de creación | Autogenerado |
| `fecha_actualizacion` | `DateTimeField` | Fecha de última actualización | Nullable, autogestionado |

---

## 2. Relaciones entre entidades

| Entidad origen | Relación | Entidad destino | Descripción |
|---|---|---|---|
| `PlanEstudio` | N:1 | `Institucion` | Cada plan de estudio pertenece a una institución |
| `GradoEscolar` | N:1 | `PlanEstudio` | Cada grado escolar pertenece a un plan de estudio |
| `GradoEscolar` | N:1 | `EducacionNivel` | Cada grado escolar requiere un nivel educativo |
| `GradoEscolar` | N:1 | `EducacionSubNivel` | Cada grado escolar puede tener un subnivel educativo |
| `Asignatura` | N:1 | `GradoEscolar` | Cada asignatura pertenece a un grado escolar |
| `EducacionSubNivel` | N:1 | `EducacionNivel` | Cada subnivel debe estar asociado a un nivel educativo |

---

## 3. Reglas de Validación de Datos

| ID | Regla | Nivel de aplicación |
|---|---|---|
| `RV-001` | El nombre del plan de estudio es obligatorio, debe ser único por institución y no debe superar 200 caracteres | Serializer |
| `RV-002` | El campo es_activo del plan de estudio es obligatorio y debe ser booleano | Serializer |
| `RV-003` | La institución es obligatoria en el plan de estudio | Serializer |
| `RV-004` | El nombre del grado escolar es obligatorio, debe ser único por plan de estudio y no debe superar 100 caracteres | Serializer |
| `RV-005` | El orden del grado escolar es obligatorio y debe ser un número positivo | Serializer |
| `RV-006` | El plan de estudio es obligatorio en el grado escolar | Serializer |
| `RV-007` | El nivel educativo es obligatorio en el grado escolar | Serializer |
| `RV-008` | El subnivel educativo es obligatorio cuando el nivel educativo dispone de subniveles en el grado escolar | Serializer |
| `RV-009` | El nombre de la asignatura es obligatorio, debe ser único por grado escolar y no debe superar 150 caracteres | Serializer |
| `RV-010` | Los períodos pedagógicos semanales mínimos de la asignatura son obligatorios y deben ser un entero positivo | Serializer |
| `RV-011` | El grado escolar es obligatorio en la asignatura | Serializer |

---

## 4. Restricciones de Integridad de Datos

| ID | Restricción | Tipo | Descripción |
|---|---|---|---|
| `RI-001` | Eliminación protegida de plan de estudio | Referencial | No se puede eliminar un plan de estudio mientras existan grados escolares asociados |
| `RI-002` | Eliminación protegida de grado escolar | Referencial | No se puede eliminar un grado escolar mientras existan asignaturas asociadas |
| `RI-003` | Unicidad de plan vigente | Dominio | Solo puede existir un plan de estudio con es_activo=True por institución |
| `RI-004` | Unicidad de nombre de plan de estudio por institución | Dominio | No pueden existir dos planes de estudio con el mismo nombre en la misma institución |
| `RI-005` | Unicidad de nombre de grado escolar por plan de estudio | Dominio | No pueden existir dos grados escolares con el mismo nombre en el mismo plan de estudio |
| `RI-006` | Unicidad de nombre de asignatura por grado escolar | Dominio | No pueden existir dos asignaturas con el mismo nombre en el mismo grado escolar |

