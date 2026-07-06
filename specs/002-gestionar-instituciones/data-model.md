# Modelo de Datos: Gestión de Instituciones y Autoridades Académicas

**Feature**: 002-gestionar-instituciones  
**Fecha**: 2026-03-22  
**Última actualización**: 2026-05-11

---

## 1. Entidades del Dominio

### Institucion

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único | Autogenerado, clave primaria |
| `nombre` | `CharField(200)` | Nombre de la institución | Obligatorio, único, máximo 200 caracteres |
| `codigo` | `CharField(20)` | Código identificador | Obligatorio, único, máximo 20 caracteres |
| `ruc` | `CharField(20)` | RUC de la institución | Obligatorio, único, máximo 20 caracteres |
| `fecha_creacion` | `DateTimeField` | Fecha de creación | Autogenerado |
| `fecha_actualizacion` | `DateTimeField` | Fecha de última actualización | Nullable, autogestionado |

### Rol

**Ubicación**: `backend/apps/organizacion/models.py`  

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador interno del rol | Autogenerado, clave primaria |
| `nombre` | `CharField` con `choices` | Nombre del rol dentro del sistema | Obligatorio, único, restringido a valores predefinidos, debe ubicarse como constante de clase para reutilización en toda la aplicación |

**Valores permitidos para `nombre` (definidos como constantes de clase)**

| Valor | Descripción |
|---|---|
| `ADMINISTRADOR` | Rol con permisos de gestión completa |
| `AUTORIDAD_ACADEMICA` | Rol con acceso restringido por institución |
| `DOCENTE` | Rol para personal docente |
| `SECRETARIA` | Rol para personal administrativo |
| `ESTUDIANTE` | Rol para estudiantes |
| `DECE` | Rol para el equipo DECE |

**Observaciones**: 
- El campo `nombre` del modelo `Rol` debe definirse como constantes de clase para evitar valores hardcodeados en consultas, validaciones o reglas de negocio.
- Django proporciona el método `get_nombre_display()` para obtener la descripción legible del choice. El frontend puede utilizar este método a través del serializer para mostrar el nombre del rol.

### UsuarioRol

**Ubicación**: `backend/apps/organizacion/models.py`

**Atributos**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador único de la asignación | Autogenerado, clave primaria |
| `usuario` | `ForeignKey(Usuario)` | Usuario al que se asigna el rol | Obligatorio |
| `rol` | `ForeignKey(Rol)` | Rol que se asigna | Obligatorio |
| `institucion` | `ForeignKey(Institucion)` | Institución vinculada | Obligatorio si rol=AUTORIDAD_ACADEMICA, nullable en caso contrario |
| `es_activo` | `BooleanField` | Estado de la asignación | Obligatorio, valor por defecto `True` |
| `fecha_desde` | `DateField` | Fecha de inicio de la asignación | Nullable, autogestionado |
| `fecha_hasta` | `DateField` | Fecha de fin de la asignación | Nullable, autogestionado |

---

## 2. Relaciones entre entidades

| Entidad origen | Relación | Entidad destino | Descripción |
|---|---|---|---|
| `UsuarioRol` | N:1 | `Usuario` | Cada asignación de rol pertenece a un usuario |
| `UsuarioRol` | N:1 | `Rol` | Cada asignación de rol corresponde a un rol |
| `UsuarioRol` | N:1 | `Institucion` | Cada asignación puede vincularse a una institución; esta relación es obligatoria para `AUTORIDAD_ACADEMICA` |

---

## 3. Reglas de Validación de Datos

| ID | Regla | Nivel de aplicación |
|---|---|---|
| `RV-001` | El nombre de la institución es obligatorio, debe ser único, no puede consistir solo en espacios en blanco y no debe superar 200 caracteres | Serializer |
| `RV-002` | El código de la institución es obligatorio, debe ser único y no debe superar 20 caracteres | Serializer |
| `RV-003` | El RUC de la institución es obligatorio, debe ser único y no debe superar 20 caracteres | Serializer |
| `RV-004` | El usuario es obligatorio en la asignación de rol | Serializer |
| `RV-005` | El rol es obligatorio en la asignación de rol | Serializer |
| `RV-006` | La institución es obligatoria cuando el rol asignado es `AUTORIDAD_ACADEMICA` | Serializer |

---

## 4. Restricciones de Integridad de Datos


| ID | Restricción | Tipo | Descripción |
|---|---|---|---|
| `RI-001` | Eliminación protegida | Referencial | No se puede eliminar una institución mientras existan asignaciones activas en `UsuarioRol` asociadas a ella |
| `RI-002` | Activación de asignación | Dominio | Toda asignación activada debe registrar la fecha actual en `fecha_desde` |
| `RI-003` | Desactivación de asignación | Dominio | Toda asignación desactivada debe registrar la fecha actual en `fecha_hasta` |
| `RI-004` | Contexto institucional activo | Dominio | El acceso operativo de `AUTORIDAD_ACADEMICA` depende de la existencia de una asignación activa asociada a una institución |
| `RI-005` | Un mismo `usuario` podrá mantener asignaciones activas del mismo `rol` en distintas `instituciones`. No obstante, para una misma combinación de `usuario`, `rol` e `institucion`, solo podrá existir una asignación activa en `UsuarioRol` en un momento dado. Se permite la existencia de múltiples asignaciones inactivas para conservar historial| 

