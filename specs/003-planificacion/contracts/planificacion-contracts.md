# Contratos de Interfaces: Gestión de Planificación Curricular

**Feature**: 003-planificacion  
**Fecha**: 2026-05-11

---

## Contrato: Listar Planes de Estudio

### Endpoint

```
GET /planes-estudio/instituciones/{id}/
```

### Descripción

Retorna todos los planes de estudio asociados a una institución educativa, con soporte para paginación, ordenamiento y búsqueda por nombre.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la institución |

### Parámetros de Consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | integer | Número de página para paginación |
| page_size | integer | Cantidad de resultados por página |
| ordering | string | Campo de ordenamiento (`nombre`, `es_activo`, `-nombre`, `-es_activo`) |
| nombre | string | Término de búsqueda por nombre (coincidencia parcial, case-insensitive) |

### Respuestas

#### 200 OK - Lista de Planes de Estudio

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "nombre": "Plan de Estudios 2026",
      "es_activo": true,
      "institucion": 1,
      "fecha_creacion": "2026-03-24T10:00:00Z",
      "fecha_actualizacion": "2026-03-24T10:00:00Z"
    }
  ]
}
```

**Significado**: Lista de planes de estudio recuperada exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución especificada.

---

## Contrato: Obtener Detalle de Plan de Estudio

### Endpoint

```
GET /planes-estudio/{id}/
```

### Descripción

Retorna los detalles de un plan de estudio específico.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del plan de estudio |

### Respuestas

#### 200 OK - Detalle del Plan de Estudio

```json
{
  "id": 1,
  "nombre": "Plan de Estudios 2026",
  "es_activo": true,
  "institucion": {
    "id": 1,
    "nombre": "Unidad Educativa Example"
  },
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T10:00:00Z"
}
```

**Significado**: Detalle del plan de estudio recuperado exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

#### 404 Not Found - Plan de Estudio No Encontrado

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El plan de estudio con el ID especificado no existe.

---

## Contrato: Crear Plan de Estudio

### Endpoint

```
POST /planes-estudio/
```

### Descripción

Registra un nuevo plan de estudio para una institución educativa.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Cuerpo de la Solicitud

```json
{
  "nombre": "Plan de Estudios 2026",
  "es_activo": true,
  "institucion": 1
}
```

### Campos de Entrada

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre del plan de estudio (máx. 200 caracteres) |
| es_activo | boolean | Sí | Indica si es el plan vigente |
| institucion | integer | Sí | Identificador de la institución educativa |

### Respuestas

#### 201 Created - Plan de Estudio Creado

```json
{
  "id": 1,
  "nombre": "Plan de Estudios 2026",
  "es_activo": true,
  "institucion": 1,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T10:00:00Z"
}
```

**Significado**: El plan de estudio fue creado exitosamente.

#### 400 Bad Request - Datos Inválidos

```json
{
  "nombre": ["Este campo es obligatorio."],
  "es_activo": ["Este campo es obligatorio."]
}
```

**Significado**: Los datos enviados no cumplen con las validaciones.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["plan de estudio con este nombre ya existe en esta institución."]
}
```

**Significado**: Ya existe un plan de estudio con el mismo nombre en la misma institución.

#### 409 Conflict - Plan Vigente Existente

```json
{
  "non_field_errors": ["Ya existe un plan de estudio vigente para esta institución."]
}
```

**Significado**: Ya existe un plan de estudio con es_activo=true para la misma institución.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Actualizar Plan de Estudio

### Endpoint

```
PATCH /planes-estudio/{id}/
```

### Descripción

Actualiza los datos de un plan de estudio existente.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del plan de estudio |

### Cuerpo de la Solicitud (Parcial)

```json
{
  "nombre": "Plan de Estudios Actualizado",
  "es_activo": false
}
```

### Respuestas

#### 200 OK - Plan de Estudio Actualizado

```json
{
  "id": 1,
  "nombre": "Plan de Estudios Actualizado",
  "es_activo": false,
  "institucion": 1,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T12:00:00Z"
}
```

**Significado**: El plan de estudio fue actualizado exitosamente.

#### 404 Not Found - Plan de Estudio No Encontrado

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El plan de estudio con el ID especificado no existe.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["plan de estudio con este nombre ya existe en esta institución."]
}
```

**Significado**: Ya existe un plan de estudio con el mismo nombre en la misma institución.

#### 409 Conflict - Plan Vigente Existente

```json
{
  "non_field_errors": ["Ya existe un plan de estudio vigente para esta institución."]
}
```

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Eliminar Plan de Estudio

### Endpoint

```
DELETE /planes-estudio/{id}/
```

### Descripción

Elimina un plan de estudio del sistema. Requiere que no existan grados escolares asociados.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del plan de estudio |

### Respuestas

#### 204 No Content - Eliminación Exitosa

**Significado**: El plan de estudio fue eliminado exitosamente.

#### 404 Not Found - Plan de Estudio No Encontrado

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El plan de estudio con el ID especificado no existe.

#### 409 Conflict - No se Puede Eliminar

```json
{
  "error": "No se puede eliminar el plan de estudio porque tiene grados escolares asociados."
}
```

**Significado**: El plan de estudio tiene grados escolares vinculados.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Listar Grados Escolares

### Endpoint

```
GET /grados-escolares/planes-estudio/{id}/
```

### Descripción

Retorna todos los grados escolares asociados a un plan de estudio, con soporte para paginación, ordenamiento y búsqueda por nombre.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del plan de estudio |

### Parámetros de Consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | integer | Número de página para paginación |
| page_size | integer | Cantidad de resultados por página |
| ordering | string | Campo de ordenamiento (`orden`, `nombre`, `nivel`, `subnivel`, `-orden`, `-nombre`, `-nivel`, `-subnivel`) |
| nombre | string | Término de búsqueda por nombre (coincidencia parcial, case-insensitive) |

### Respuestas

#### 200 OK - Lista de Grados Escolares

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "nombre": "Primero de Primaria",
      "orden": 1,
      "plan_estudio": 1,
      "nivel": {
        "id": 1,
        "nombre": "Educación Primaria"
      },
      "subnivel": null,
      "alerta_carga_pedagogica": true,
      "carga_pedagogica_actual": 15,
      "carga_pedagogica_minima": 25,
      "fecha_creacion": "2026-03-24T10:00:00Z",
      "fecha_actualizacion": "2026-03-24T10:00:00Z"
    }
  ]
}
```

**Significado**: Lista de grados escolares recuperada exitosamente.
- `alerta_carga_pedagogica`: true si la suma de `pp_semana_minimo` de las asignaturas es menor al mínimo requerido (del subnivel si dispone de ello o del nivel).
- `carga_pedagogica_actual`: Suma actual de períodos pedagógicos de las asignaturas.
- `carga_pedagogica_minima`: Mínimo requerido (del subnivel si dispone de ello o del nivel).

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Obtener Detalle de Grado Escolar

### Endpoint

```
GET /grados-escolares/{id}/
```

### Descripción

Retorna los detalles de un grado escolar específico, incluyendo la alerta de carga pedagógica.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del grado escolar |

### Respuestas

#### 200 OK - Detalle del Grado Escolar

```json
{
  "id": 1,
  "nombre": "Primero de Primaria",
  "orden": 1,
  "plan_estudio": {
    "id": 1,
    "nombre": "Plan de Estudios 2026"
  },
  "nivel": {
    "id": 1,
    "nombre": "Educación Primaria",
    "pp_minutos": 40,
    "pp_semana_minimo": 25
  },
  "subnivel": null,
  "alerta_carga_pedagogica": true,
  "carga_pedagogica_actual": 15,
  "carga_pedagogica_minima": 25,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T10:00:00Z"
}
```

**Significado**: Detalle del grado escolar recuperado exitosamente.

- `alerta_carga_pedagogica`: true si la suma de pp_semana_minimo de las asignaturas es menor al mínimo requerido (del subnivel si dispone de ello o del nivel). 
- `carga_pedagogica_actual`: Suma actual de períodos pedagógicos de las asignaturas.
- `carga_pedagogica_minima`: Mínimo requerido (del subnivel si dispone de ello o del nivel).

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

#### 404 Not Found - Grado Escolar No Encontrado

```json
{
  "detail": "No encontrado."
}
```

---

## Contrato: Crear Grado Escolar

### Endpoint

```
POST /grados-escolares/
```

### Descripción

Registra un nuevo grado escolar dentro de un plan de estudio.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Cuerpo de la Solicitud

```json
{
  "nombre": "Primero de Primaria",
  "orden": 1,
  "plan_estudio": 1,
  "nivel": 1,
  "subnivel": null
}
```

### Campos de Entrada

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre del grado escolar (máx. 100 caracteres) |
| orden | integer | Sí | Orden del grado en el plan (número positivo) |
| plan_estudio | integer | Sí | Identificador del plan de estudio |
| nivel | integer | Sí | Identificador del nivel educativo |
| subnivel | integer | Condicional | Identificador del subnivel educativo (obligatorio si el nivel tiene subniveles) |

### Respuestas

#### 201 Created - Grado Escolar Creado

```json
{
  "id": 1,
  "nombre": "Primero de Primaria",
  "orden": 1,
  "plan_estudio": 1,
  "nivel": {
    "id": 1,
    "nombre": "Educación Primaria"
  },
  "subnivel": null,
  "alerta_carga_pedagogica": false,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T10:00:00Z"
}
```

#### 400 Bad Request - Datos Inválidos

```json
{
  "nombre": ["Este campo es obligatorio."],
  "orden": ["Este campo es obligatorio."],
  "nivel": ["Este campo es obligatorio."]
}
```

#### 400 Bad Request - Subnivel Requerido

```json
{
  "subnivel": ["Este campo es obligatorio para el nivel seleccionado."]
}
```

**Significado**: El nivel educativo requiere un subnivel.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["grado escolar con este nombre ya existe en este plan de estudio."]
}
```

**Significado**: Ya existe un grado escolar con el mismo nombre en el mismo plan de estudio.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Actualizar Grado Escolar

### Endpoint

```
PATCH /grados-escolares/{id}/
```

### Descripción

Actualiza los datos de un grado escolar existente.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del grado escolar |


### Cuerpo de la Solicitud (Parcial)

```json
{
  "nombre": "Segundo de Primaria",
  "orden": 2,
  "nivel": 1,
  "subnivel": null
}
```

### Respuestas

 #### 200 OK - Grado Escolar Actualizado

```json
{
  "id":1,
  "nombre": "Segundo de Primaria",
  "orden": 2,
  "plan_estudio": 1,
  "nivel": {
    "id": 1,
    "nombre": "Educación Primaria"
  },
  "subnivel": null,
  "alerta_carga_pedagogica": false,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T12:00:00Z"
}
```

#### 404 Not Found - Grado Escolar No Encontrado

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El grado escolar con el ID especificado no existe.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["grado escolar con este nombre ya existe en este plan de estudio."]
}
```

**Significado**: Ya existe un grado escolar con el mismo nombre en el mismo plan de estudio.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Eliminar Grado Escolar

### Endpoint

```
DELETE /grados-escolares/{id}/
```

### Descripción

Elimina un grado escolar del sistema. Requiere que no existan asignaturas asociadas.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del grado escolar |

### Respuestas

 #### 204 No Content - Eliminación Exitosa

**Significado**: El grado escolar fue eliminado exitosamente.

#### 404 Not Found - Grado Escolar No Encontrado

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El grado escolar con el ID especificado no existe.

#### 409 Conflict - No se Puede Eliminar

```json
{
  "error": "No se puede eliminar el grado escolar porque tiene asignaturas asociadas."
}
```

**Significado**: El grado escolar tiene asignaturas vinculadas.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Listar Asignaturas

### Endpoint

```
GET /asignaturas/grados-escolares/{id}/
```

### Descripción

Retorna todas las asignaturas asociadas a un grado escolar.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del grado escolar |

### Respuestas

#### 200 OK - Lista de Asignaturas

```json
[
  {
    "id": 1,
    "nombre": "Matemáticas",
    "pp_semana_minimo": 5,
    "grado_escolar": 1,
    "fecha_creacion": "2026-03-24T10:00:00Z",
    "fecha_actualizacion": "2026-03-24T10:00:00Z"
  }
]
```

**Significado**: Lista de asignaturas recuperada exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Obtener Detalle de Asignatura

### Endpoint

```
GET /asignaturas/{id}/
```

### Descripción

Retorna los detalles de una asignatura específica.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la asignatura |

### Respuestas

#### 200 OK - Detalle de la Asignatura

```json
{
  "id": 1,
  "nombre": "Matemáticas",
  "pp_semana_minimo": 5,
  "grado_escolar": {
    "id": 1,
    "nombre": "Primero de Primaria",
    "orden": 1
  },
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T10:00:00Z"
}
```

**Significado**: Detalle de la asignatura recuperado exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

#### 404 Not Found - Asignatura No Encontrada

```json
{
  "detail": "No encontrado."
}
```

---

## Contrato: Crear Asignatura

### Endpoint

```
POST /asignaturas/
```

### Descripción

Registra una nueva asignatura dentro de un grado escolar.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Cuerpo de la Solicitud

```json
{
  "nombre": "Matemáticas",
  "pp_semana_minimo": 5,
  "grado_escolar": 1
}
```

### Campos de Entrada

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre de la asignatura (máx. 150 caracteres) |
| pp_semana_minimo | integer | Sí | Períodos pedagógicos mínimos semanales (entero positivo) |
| grado_escolar | integer | Sí | Identificador del grado escolar |

### Respuestas

#### 201 Created - Asignatura Creada

```json
{
  "id": 1,
  "nombre": "Matemáticas",
  "pp_semana_minimo": 5,
  "grado_escolar": 1,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T10:00:00Z"
}
```

**Significado**: La asignatura fue creada exitosamente.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["asignatura con este nombre ya existe en este grado escolar."]
}
```

**Significado**: Ya existe una asignatura con el mismo nombre en el mismo grado escolar.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Actualizar Asignatura

### Endpoint

```
PATCH /asignaturas/{id}/
```

### Descripción

Actualiza los datos de una asignatura existente.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la asignatura |

### Cuerpo de la Solicitud (Parcial)

```json
{
  "nombre": "Matemáticas Avanzadas",
  "pp_semana_minimo": 6
}
```

### Respuestas

 #### 200 OK - Asignatura Actualizada

```json
{
  "id":1,
  "nombre": "Matemáticas Avanzadas",
  "pp_semana_minimo": 6,
  "grado_escolar": 1,
  "fecha_creacion": "2026-03-24T10:00:00Z",
  "fecha_actualizacion": "2026-03-24T12:00:00Z"
}
```

#### 404 Not Found - Asignatura No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: La asignatura con el ID especificado no existe.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["asignatura con este nombre ya existe en este grado escolar."]
}
```

**Significado**: Ya existe una asignatura con el mismo nombre en el mismo grado escolar.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Eliminar Asignatura

### Endpoint

```
DELETE /asignaturas/{id}/
```

### Descripción

Elimina una asignatura del sistema.

### Autenticación Requerida

Sí (requiere rol AUTORIDAD_ACADEMICA con acceso a la institución del plan de estudio)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la asignatura |

### Respuestas

 #### 204 No Content - Eliminación Exitosa

**Significado**: La asignatura fue eliminada exitosamente.

#### 404 Not Found - Asignatura No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: La asignatura con el ID especificado no existe.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos o Acceso Denegado

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene acceso a la institución del plan de estudio.

---

## Contrato: Listar Niveles Educativos

### Endpoint

```
GET /educacion-niveles/
```

### Descripción

Retorna todos los niveles educativos disponibles en el sistema. Solo lectura.

### Autenticación Requerida

Sí (cualquier usuario autenticado)

### Respuestas

#### 200 OK - Lista de Niveles Educativos (con subniveles)

```json
[
  {
    "id": 1,
    "nombre": "Educación Inicial",
    "pp_minutos": 30,
    "pp_semana_minimo": 20,
    "subniveles": []
  },
  {
    "id": 2,
    "nombre": "Educación Primaria",
    "pp_minutos": 40,
    "pp_semana_minimo": 25,
    "subniveles": [
      {
        "id": 1,
        "nombre": "Primer Ciclo",
        "pp_semana_minimo": 22
      },
      {
        "id": 2,
        "nombre": "Segundo Ciclo",
        "pp_semana_minimo": 24
      }
    ]
  },
  {
    "id": 3,
    "nombre": "Educación Secundaria",
    "pp_minutos": 45,
    "pp_semana_minimo": 30,
    "subniveles": []
  }
]
```

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

---

## Diagrama de Estados: PlanEstudio

```
┌─────────────────────────────────────┐
│     PlanEstudio Inactivo            │
│     es_activo = false                │
└──────────────────┬──────────────────┘
                   │
                   │ POST /planes-estudio/
                   │ (crear con es_activo=true)
                   ▼
┌─────────────────────────────────────┐
│     PlanEstudio Activo (Vigente)    │
│     es_activo = true                 │
│     (Solo uno por institución)      │
└──────────────────┬──────────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
PATCH /planes-estudio/{id}/    PATCH /planes-estudio/{id}/
(es_activo=false)               (es_activo=true)
    │                             │
    ▼                             │
┌─────────────────────┐           │
│ PlanEstudio         │◄──────────┘
│ Inactivo            │ (cambiar a activo)
└─────────────────────┘
```

---

## Notas de Implementación

1. **Autenticación**: Todos los endpoints requieren token de autenticación en el header `Authorization: Token <token>`.

2. **Permisos**: AUTORIDAD_ACADEMICA solo puede acceder a la institución que le fue asignada de forma activa.

3. **Validación de subnivel**: El campo `subnivel` es obligatorio cuando el nivel educativo tiene subniveles definidos.

4. **Validación de plan vigente**: Solo puede existir un plan de estudio con es_activo=true por institución.

5. **Alerta de carga pedagógica**: El campo `alerta_carga_pedagogica` se calcula automáticamente en la respuesta del endpoint de grados escolares, comparando la suma de pp_semana_minimo de las asignaturas contra el mínimo del subnivel si dispone de ello o del nivel.

6. **Eliminación protegida**: 
   - No se puede eliminar un plan de estudio con grados escolares asociados.
   - No se puede eliminar un grado escolar con asignaturas asociadas.
