# Contratos de Interfaces: Autenticación

**Feature**: 001-user-auth  
**Fecha**: 2026-05-11

> **Referencia**: Las entidades, reglas de validación y restricciones de integridad se encuentran definidas en `data-model.md`.

---

## Contrato: Inicio de Sesión

### Endpoint

```
POST /login/
```

### Descripción

Permite a los usuarios autenticarse en el sistema mediante su número de identificación y password.

### Autenticación Requerida

No (este endpoint es público)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Content-Type | application/json | Sí |

### Cuerpo de la Solicitud

```json
{
  "numero_identificacion": "string",
  "password": "string"
}
```

### Campos de Entrada

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| numero_identificacion | string | Sí | Número de identificación del usuario |
| password | string | Sí | Contraseña del usuario |

### Respuestas

#### 200 OK - Inicio de Sesión Exitoso

```json
{
  "token": "string",
  "usuario": {
    "id": 1,
    "numero_identificacion": "12345678",
    "first_name": "Susana",
    "last_name": "Peralta",
    "is_active": true
  }
}
```

**Significado**: El usuario fue autenticado correctamente y se creó una sesión activa.

#### 400 Bad Request - Campos Inválidos

```json
{
  "numero_identificacion": ["Este campo es obligatorio."],
  "password": ["Este campo es obligatorio."]
}
```

**Significado**: Los datos enviados no cumplen con las validaciones básicas.

#### 401 Unauthorized - Credenciales Inválidas

```json
{
  "error": "Credenciales inválidas"
}
```

**Significado**: El número de identificación o la contraseña son incorrectos.

#### 403 Forbidden - Cuenta Inactiva

```json
{
  "error": "Cuenta inactiva"
}
```

**Significado**: El usuario existe pero su cuenta está inactiva.

---

## Contrato: Cierre de Sesión

### Endpoint

```
POST /logout/
```

### Descripción

Permite a los usuarios autenticados cerrar su sesión de forma segura.

### Autenticación Requerida

Sí (requiere sesión activa)

### Encabezados de Solicitud

| Encabezado | Valor | Requerido |
|------------|-------|-----------|
| Authorization | Token ... | Sí |

### Cuerpo de la Solicitud

No requiere cuerpo (vacío)

### Respuestas

#### 200 OK - Cierre de Sesión Exitoso

```json
{
  "mensaje": "Sesión cerrada correctamente"
}
```

**Significado**: La sesión fue invalidada correctamente.

#### 401 Unauthorized - No Autenticado

```json
{
  "error": "No autenticado"
}
```

**Significado**: No existe una sesión activa para este usuario.

---

## Diagrama de Estados

```
                    ┌──────────────────┐
                    │   Sin Sesión     │
                    │   (Anónimo)      │
                    └────────┬─────────┘
                             │
                             │ POST /login/
                             │ (credenciales válidas)
                             ▼
                    ┌──────────────────┐
                    │  Sesión Activa   │
                    │  (Autenticado)   │
                    └────────┬─────────┘
                             │
                             │ POST /logout/
                             │ (cierre explícito)
                             ▼
                    ┌──────────────────┐
                    │   Sin Sesión     │
                    │   (Anónimo)      │
                    └──────────────────┘
```
