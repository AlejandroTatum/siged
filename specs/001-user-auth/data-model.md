# Modelo de Datos: Autenticación

**Feature**: 001-user-auth  
**Fecha**: 2026-05-11

---

## 1. Entidades del dominio

### Usuario

**Ubicación**: `backend/apps/core/models.py`  
**Herencia**: extiende `AbstractUser` de Django

**Atributos relevantes**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `id` | `AutoField` | Identificador interno del usuario | Autogenerado, clave primaria |
| `numero_identificacion` | `CharField(20)` | Número de identificación usado para autenticación | Obligatorio, único, máximo 20 caracteres |
| `password` | `CharField` | Contraseña almacenada de forma cifrada | Obligatoria, gestionada por Django |
| `first_name` | `CharField` | Nombres del usuario | Valor gestionada por Django  |
| `last_name` | `CharField` | Apellidos del usuario | Valor gestionada por Django  |
| `is_active` | `BooleanField` | Estado de actividad del usuario | Obligatorio, valor por defecto `True` gestionada por Django  |
| `last_login` | `DateTimeField` | Fecha y hora del último inicio de sesión | Nullable, gestionado por Django |
| `date_joined` | `DateTimeField` | Fecha y hora de creación del usuario | Autogenerado,  gestionado por Django |


**Observaciones**
- El campo `password` no se expone en respuestas.
- La autenticación funcional se realiza con `numero_identificacion` y `password`.


### Token

**Origen**: `rest_framework.authtoken.models.Token`  
**Gestión**: Django REST Framework

**Atributos relevantes**

| Campo | Tipo | Descripción | Restricciones |
|---|---|---|---|
| `key` | `CharField(40)` | Valor único del token | Clave primaria o valor único |
| `user` | Relación con `Usuario` | Usuario asociado al token | Obligatorio |
| `created` | `DateTimeField` | Fecha y hora de creación del token | Autogenerado |

---

## 2. Relaciones entre entidades

| Entidad origen | Relación | Entidad destino | Descripción |
|---|---|---|---|
| `Token` | N:1 | `Usuario` | Cada token pertenece a un único usuario autenticado |

---
## 3. Reglas de validación de datos

| ID | Regla | Nivel de aplicación |
|---|---|---|
| `RV-001` | El número de identificación es obligatorio en la solicitud de inicio de sesión | Serializer |
| `RV-002` | La contraseña es obligatoria en la solicitud de inicio de sesión | Serializer |
| `RV-003` | El número de identificación debe corresponder a un usuario existente | Servicio |
| `RV-004` | La contraseña ingresada debe coincidir con la credencial almacenada | Servicio |
| `RV-005` | El usuario debe encontrarse activo para permitir el inicio de sesión | Servicio |
| `RV-006` | El token enviado en logout debe existir y corresponder a una sesión válida | Servicio |

---

## 4. Restricciones de integridad de datos

| ID | Restricción | Tipo | Descripción |
|---|---|---|---|
| `RI-001` | Token asociado a usuario válido | Referencial | No puede existir un token sin un usuario asociado |
| `RI-002` | Eliminación del token en logout | Operativa | Un token eliminado no debe permitir acceso posterior a recursos protegidos |
| `RI-003` | Acceso condicionado por estado activo | Dominio | Solo se permite el acceso cuando `is_active = True` |
| `RI-004` | Token como credencial de acceso | Dominio | El token constituye la credencial válida para acceder a recursos protegidos |
