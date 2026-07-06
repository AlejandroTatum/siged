# Contratos de Interfaces: Gestión de Instituciones y Autoridades Académicas

**Feature**: 002-gestionar-instituciones  
**Fecha**: 2026-03-22  
**Última actualización**: 2026-05-11

---

## Contrato: Listar Instituciones

### Endpoint

```
GET /instituciones/
```

### Descripción

Retorna todas las instituciones educativas registradas en el sistema.
Soporta paginación, ordenamiento y búsqueda por nombre. Por cada institución lista solo las asignaciones activas de autoridad académica.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |
| Content-Type | application/json | Sí |

### Parámetros de Consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| page | integer | Número de página para paginación |
| page_size | integer | Cantidad de resultados por página |
| ordering | string | Campo de ordenamiento (`nombre`, `codigo`, `ruc`, `-nombre`, `-codigo`, `-ruc`) |
| nombre | string | Término de búsqueda por nombre (case-insensitive, coincidencia parcial) |

### Respuestas

#### 200 OK - Lista de Instituciones

```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "nombre": "Unidad Educativa Example",
      "codigo": "UE-001",
      "ruc": "1234567890001",
      "fecha_creacion": "2026-03-22T10:00:00Z",
      "fecha_actualizacion": "2026-03-22T10:00:00Z",
      "autoridades_academicas": [
        {
          "id": 1,
          "usuario": {
            "id": 1,
            "username": "autoridad1",
            "first_name": "Juan",
            "last_name": "Pérez"
          },
          "rol": {
            "id": 2,
            "nombre": "AUTORIDAD_ACADEMICA",
            "nombre_display": "Autoridad académica"
          },
          "es_activo": true,
          "fecha_desde": "2026-03-22"
        }
      ]
    }
  ]
}
```

**Significado**: Lista de instituciones recuperada exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Obtener Detalle de Institución

### Endpoint

```
GET /instituciones/{id}/
```

### Descripción

Retorna los detalles de una institución educativa específica.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR o rol AUTORIDAD_ACADEMICA con acceso a la institución)

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la institución |

### Respuestas

#### 200 OK - Detalle de la Institución

```json
{
  "id": 1,
  "nombre": "Unidad Educativa Example",
  "codigo": "UE-001",
  "ruc": "1234567890001",
  "fecha_creacion": "2026-03-22T10:00:00Z",
  "fecha_actualizacion": "2026-03-22T10:00:00Z"
}
```

**Significado**: Detalle de la institución recuperado exitosamente.

#### 404 Not Found - Institución No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: La institución con el ID especificado no existe.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR o AUTORIDAD_ACADEMICA con acceso a la institución.

---

## Contrato: Crear Institución

### Endpoint

```
POST /instituciones/
```

### Descripción

Registra una nueva institución educativa en el sistema.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Cuerpo de la Solicitud

```json
{
  "nombre": "string",
  "codigo": "string",
  "ruc": "string"
}
```

### Campos de Entrada

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre de la institución único ( máx. 200 caracteres) |
| codigo | string | Sí | Código identificador único (máx. 20 caracteres) |
| ruc | string | Sí | RUC de la institución único (máx. 20 caracteres) |

### Respuestas

#### 201 Created - Institución Creada

```json
{
  "id": 1,
  "nombre": "Unidad Educativa Example",
  "codigo": "UE-001",
  "ruc": "1234567890001",
  "fecha_creacion": "2026-03-22T10:00:00Z",
  "fecha_actualizacion": "2026-03-22T10:00:00Z"
}
```

**Significado**: La institución fue creada exitosamente.

#### 400 Bad Request - Datos Inválidos

```json
{
  "nombre": ["Este campo es obligatorio."],
  "codigo": ["Este campo es obligatorio."],
  "ruc": ["Este campo es obligatorio."]
}
```

**Significado**: Los datos enviados no cumplen con las validaciones.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["institución con este nombre ya existe."],
  "codigo": ["institución con este código ya existe."],
  "ruc": ["institución con este ruc ya existe."]

}
```

**Significado**: El nombre, código o RUC ya está registrado en el sistema.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Actualizar Institución

### Endpoint

```
PATCH /instituciones/{id}/
```

### Descripción

Actualiza los datos de una institución educativa existente.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la institución |

### Cuerpo de la Solicitud (Parcial)

```json
{
  "nombre": "string",
  "codigo": "string",
  "ruc": "string"
}
```

### Respuestas

#### 200 OK - Institución Actualizada

```json
{
  "id": 1,
  "nombre": "Unidad Educativa Updated",
  "codigo": "UE-001",
  "ruc": "1234567890001",
  "fecha_creacion": "2026-03-22T10:00:00Z",
  "fecha_actualizacion": "2026-03-22T12:00:00Z"
}
```

**Significado**: La institución fue actualizada exitosamente.

#### 404 Not Found - Institución No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: La institución con el ID especificado no existe.

#### 400 Bad Request - Duplicado

```json
{
  "nombre": ["institución con este nombre ya existe."],
  "codigo": ["institución con este código ya existe."],
  "ruc": ["institución con este ruc ya existe."]
}
```

**Significado**: El nombre, código o RUC ya está registrado en el sistema.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Eliminar Institución

### Endpoint

```
DELETE /instituciones/{id}/
```

### Descripción

Elimina una institución del sistema. Requiere que no existan dependencias activas.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador de la institución |

### Respuestas

#### 204 No Content - Eliminación Exitosa

**Significado**: La institución fue eliminada exitosamente.

#### 404 Not Found - Institución No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: La institución con el ID especificado no existe.

#### 409 Conflict - No se Puede Eliminar

```json
{
  "error": "No se puede eliminar la institución porque tiene autoridades académicas activas."
}
```

**Significado**: La institución tiene dependencias activas (UsuarioRol con es_activo=true y rol=AUTORIDAD_ACADEMICA).

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Listar Instituciones del Usuario en Sesión

### Endpoint

```
GET /instituciones/usuario/
```

### Descripción

Retorna las instituciones educativas que tienen asignaciones activas con el usuario en sesión. Las instituciones aparecen sin duplicidad aunque el usuario tenga múltiples asignaciones activas.

### Autenticación Requerida

Sí (cualquier usuario autenticado)

### Respuestas

#### 200 OK - Lista de Instituciones del Usuario

```json
[
  {
    "id": 1,
    "nombre": "Unidad Educativa Example",
    "codigo": "UE-001",
    "ruc": "1234567890001",
    "fecha_creacion": "2026-03-22T10:00:00Z",
    "fecha_actualizacion": "2026-03-22T10:00:00Z"
  }
]
```

**Significado**: Lista de instituciones con asignaciones activas del usuario en sesión.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

---

## Contrato: Listar Asignaciones de Rol (UsuarioRol)

### Endpoint

```
GET /usuarioroles/
```

### Descripción

Retorna todas las asignaciones de rol registradas. Opcionalmente puede filtrar por institución.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| institucion | integer | Filtrar por institución específica |

### Respuestas

#### 200 OK - Lista de Asignaciones

```json
[
  {
    "id": 1,
    "usuario": {
      "id": 1,
      "username": "autoridad1",
      "first_name": "Juan",
      "last_name": "Pérez"
    },
    "rol": {
      "id": 1,
      "nombre": "AUTORIDAD_ACADEMICA",
      "nombre_display": "Autoridad académica"
    },
    "institucion": {
      "id": 1,
      "nombre": "Unidad Educativa Example"
    },
    "es_activo": true,
    "fecha_desde": "2026-03-22",
    "fecha_hasta": null
  }
]
```

**Significado**: Lista de asignaciones recuperada exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---


## Contrato: Listar Roles del Usuario en Sesión

### Endpoint

```
GET /usuarioroles/roles/
```

### Descripción

Retorna todos los roles que tienen asignaciones activas asociadas al usuario en sesión, sin duplicidad.

### Autenticación Requerida

Sí (cualquier usuario autenticado)

### Respuestas

#### 200 OK - Lista de Roles del Usuario

```json
[
  {
    "id": 1,
    "nombre": "ADMINISTRADOR",
    "nombre_display": "Administrador"
  },
  {
    "id": 2,
    "nombre": "AUTORIDAD_ACADEMICA",
    "nombre_display": "Autoridad académica"
  }
]
```

**Significado**: Lista de roles con asignaciones activas del usuario en sesión, sin duplicados. El id de cada registro retornado corresponde al identificador del `Rol`.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

---

## Contrato: Crear Asignación de Rol (UsuarioRol)

### Endpoint

```
POST /usuarioroles/
```

### Descripción

Asigna un rol a un usuario, opcionalmente vinculado a una institución. Para el rol AUTORIDAD_ACADEMICA, la institución es obligatoria.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Cuerpo de la Solicitud

```json
{
  "usuario": 1,
  "rol": 2,
  "institucion": 1
}
```

### Campos de Entrada

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| usuario | integer | Sí | Identificador del usuario |
| rol | integer | Sí | Identificador del rol |
| institucion | integer | Condicional | Identificador de la institución (obligatorio si rol=AUTORIDAD_ACADEMICA) |

**Nota**: Las fechas `fecha_desde` y `fecha_hasta` no se capturan manualmente. Se autogestionan mediante las acciones de activar/desactivar la asignación.

### Respuestas

#### 201 Created - Asignación Creada

```json
{
  "id": 1,
  "usuario": {
    "id": 1,
    "username": "autoridad1",    
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "rol": {
    "id": 1,
    "nombre": "AUTORIDAD_ACADEMICA",
    "nombre_display": "Autoridad académica"
  },
  "institucion": {
    "id": 1,
    "nombre": "Unidad Educativa Example"
  },
  "es_activo": true,
  "fecha_desde": "2026-03-22",
  "fecha_hasta": null
}
```

**Significado**: La asignación fue creada exitosamente con `es_activo=True` por defecto. La `fecha_desde` se autogestiona con la fecha actual.

#### 400 Bad Request - Datos Inválidos

```json
{
  "institucion": ["Este campo es obligatorio para el rol AUTORIDAD_ACADEMICA."]
}
```

**Significado**: No se proporcionó la institución siendo requerida.

#### 400 Bad Request - Asignación Duplicada

```json
{
  "non_field_errors": ["Ya existe una asignación activa para este usuario, rol e institución."]
}
```

**Significado**: Ya existe una asignación activa para la combinación de usuario, rol e institución especificada.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Actualizar Asignación de Rol

### Endpoint

```
PATCH /usuarioroles/{id}/
```

### Descripción

Modifica los datos de una asignación existente.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del UsuarioRol |

### Cuerpo de la Solicitud (Parcial)

```json
{
  "usuario": 1,
  "rol": 2,
  "institucion": 1
}
```

**Nota**: Las fechas `fecha_desde` y `fecha_hasta` no se modifican manualmente. Se gestionan mediante el endpoint de cambiar estado.

### Respuestas

#### 200 OK - Asignación Actualizada

```json
{
  "id": 1,
  "usuario": {
    "id": 1,
    "username": "autoridad1",    
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "rol": {
    "id": 1,
    "nombre": "AUTORIDAD_ACADEMICA",
    "nombre_display": "Autoridad académica"
  },
  "institucion": {
    "id": 1,
    "nombre": "Unidad Educativa Example"
  },
  "es_activo": true,
  "fecha_desde": "2026-03-22",
  "fecha_hasta": null
}
```

**Significado**: La asignación fue actualizada exitosamente. Las fechas no se modifican manualmente en este endpoint.

#### 404 Not Found - Asignación No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El UsuarioRol con el ID especificado no existe.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Cambiar Estado de Asignación

### Endpoint

```
PATCH /usuarioroles/{id}/estado/
```

### Descripción

Activa o desactiva una asignación de rol.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del UsuarioRol |

### Cuerpo de la Solicitud

```json
{
  "es_activo": false
}
```

**Nota**: Al activar (`es_activo=true`), se registra la fecha actual en `fecha_desde`. Al desactivar (`es_activo=false`), se registra la fecha actual en `fecha_hasta`.

### Respuestas

#### 200 OK - Estado Actualizado (Desactivar)

```json
{
  "id": 1,
  "usuario": {
    "id": 1,
    "username": "autoridad1",    
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "rol": {
    "id": 1,
    "nombre": "AUTORIDAD_ACADEMICA",
    "nombre_display": "Autoridad académica"
  },
  "institucion": {
    "id": 1,
    "nombre": "Unidad Educativa Example"
  },
  "es_activo": false,
  "fecha_desde": "2026-03-22",
  "fecha_hasta": "2026-04-11"
}
```

**Significado**: La asignación fue desactivada exitosamente. Se registró la fecha actual en `fecha_hasta`.

#### 200 OK - Estado Actualizado (Activar)

```json
{
  "id": 1,
  "usuario": {
    "id": 1,
    "username": "autoridad1",    
    "first_name": "Juan",
    "last_name": "Pérez"
  },
  "rol": {
    "id": 1,
    "nombre": "AUTORIDAD_ACADEMICA",
    "nombre_display": "Autoridad académica"
  },
  "institucion": {
    "id": 1,
    "nombre": "Unidad Educativa Example"
  },
  "es_activo": true,
  "fecha_desde": "2026-04-11",
  "fecha_hasta": null
}
```

**Significado**: La asignación fue activada exitosamente. Se limpió `fecha_hasta` y se registró la fecha actual en `fecha_desde`.

#### 404 Not Found - Asignación No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El UsuarioRol con el ID especificado no existe.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Eliminar Asignación de Rol

### Endpoint

```
DELETE /usuarioroles/{id}/
```

### Descripción

Elimina una asignación de rol.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| id | integer | Identificador del UsuarioRol |

### Respuestas

#### 204 No Content - Eliminación Exitosa

**Significado**: La asignación fue eliminada exitosamente.

#### 404 Not Found - Asignación No Encontrada

```json
{
  "detail": "No encontrado."
}
```

**Significado**: El UsuarioRol con el ID especificado no existe.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Contrato: Listar Usuarios

### Endpoint

```
GET /usuarios/
```

### Descripción

Retorna la lista de usuarios del sistema. Opcionalmente puede filtrar por estado activo.

### Autenticación Requerida

Sí (requiere rol ADMINISTRADOR)

### Parámetros de Consulta (Opcionales)

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| activo | boolean | Filtrar usuarios por estado activo (true/false) |

### Respuestas

#### 200 OK - Lista de Usuarios

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "numero_identificacion": "000000001",
    "is_active": true
  },
  {
    "id": 2,
    "username": "autoridad1",
    "email": "autoridad1@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "numero_identificacion": "1234567890",
    "is_active": true
  }
]
```

**Significado**: Lista de usuarios recuperada exitosamente.

#### 200 OK - Lista Filtrada por Estado Activo

```
GET /usuarios/?activo=true
```

```json
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "first_name": "Admin",
    "last_name": "User",
    "numero_identificacion": "000000001",
    "is_active": true
  }
]
```

**Significado**: Lista de usuarios activos recuperada exitosamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "detail": "Las credenciales de autenticación no se proporcionaron."
}
```

**Significado**: No existe una sesión activa para este usuario.

#### 403 Forbidden - Sin Permisos

```json
{
  "detail": "No tiene permisos para realizar esta acción."
}
```

**Significado**: El usuario no tiene el rol ADMINISTRADOR.

---

## Diagrama de Estados: UsuarioRol

```
                     ┌─────────────────────────────────────┐
                     │     Sin UsuarioRol Activo          │
                     │     (Acceso Denegado)              │
                     └──────────────────┬──────────────────┘
                                        │
                                        │ POST /usuarioroles/
                                        │ (crear asignación)
                                        ▼
                     ┌─────────────────────────────────────┐
                     │     UsuarioRol Activo               │
                     │     (Acceso Habilitado)             │
                     │     es_activo = true                 │
                     └──────────────────┬──────────────────┘
                                        │
                     ┌──────────────────┴──────────────────┐
                     │                                     │
                     ▼                                     ▼
       PATCH /usuarioroles/{id}/estado/          PATCH /usuarioroles/{id}/estado/
       (desactivar) es_activo=false               (activar) es_activo=true
                     ▼                                     ▲
       ┌─────────────────────────────────────┐            │
       │     UsuarioRol Inactivo             │            │
       │     (Acceso Denegado)               │────────────┘
       └─────────────────────────────────────┘
```

---

## Notas de Implementación

1. **Autenticación**: Todos los endpoints requieren token de autenticación en el header `Authorization: Token <token>`.

2. **Permisos**: Solo usuarios con rol ADMINISTRADOR pueden acceder a los endpoints de gestión de instituciones y usuarioroles. El endpoint `/instituciones/usuario/` y  `/usuarioroles/roles/` está disponible para cualquier usuario autenticado.

3. **Validación de AUTORIDAD_ACADEMICA**: Para el rol AUTORIDAD_ACADEMICA, el campo `institucion` es obligatorio en la creación y actualización.

4. **Eliminación protegida**: No se puede eliminar una institución con UsuarioRol activos donde rol=AUTORIDAD_ACADEMICA y es_activo=true.

5. **Búsqueda case-insensitive**: La búsqueda por nombre utiliza coincidencia parcial sin distinción de mayúsculas/minúsculas.

6. **Autoridades académicas en instituciones**: En los endpoints de listado de instituciones, el campo `autoridades_academicas` retorna únicamente las autoridades activas (`es_activo=true` y `rol=AUTORIDAD_ACADEMICA`) asociadas a cada institución.

7. **Visualización de roles**: El objeto Rol en las respuestas debe incluir `nombre` (constante) y `nombre_display` (descripción legible). Django proporciona el método `get_nombre_display()` para obtener la descripción legible del choice. El serializer debe exponer ambos valores.

8. **Endpoint de usuarios**: El endpoint `GET /usuarios/` pertenece a la app `core` y se utiliza en el flujo de creación/edición de asignaciones de autoridad académica para seleccionar el usuario al que se asignará el rol.

9. **Unificación de listado y búsqueda**: El listado, paginación, ordenamiento y búsqueda por nombre de instituciones se unifican en el endpoint `GET /instituciones/` mediante parámetros opcionales. No existe un endpoint separado para búsqueda.
