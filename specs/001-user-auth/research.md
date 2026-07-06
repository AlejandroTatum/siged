# Investigación: Autenticación de Usuario

**Feature**: 001-user-auth  
**Fecha**: 2026-05-11

---

## 2. Decisiones de diseño e implementación

### D1: Extender AbstractUser en lugar de crear modelo desde cero

**Contexto**: Se requiere un modelo de Usuario con autenticación.

**Decisión**: `Usuario` extiende `AbstractUser` de Django.

**Rationale**: 
- Hereda campos probados de Django (`password`, `is_active`, `first_name`, `last_name`, `last_login`, `date_joined`)
- Integración nativa con autenticación de Django
- Reduce código y riesgos de seguridad

---

### D2: Registro de Usuario en el panel de administración

**Contexto**: Se requiere gestionar usuarios desde el panel de administración.

**Decisión**: La entidad `Usuario` debe registrarse en el panel de administración de Django.

**Rationale**:
- Permite la gestión de usuarios desde la interfaz administrativa de Django
- Facilita las tareas de administración del sistema
- Aprovecha la funcionalidad nativa de Django Admin

---

### D3: TokenAuthentication de DRF (vs JWT)

**Contexto**: Se requiere un mecanismo de sesión para APIs.

**Decisión**: Usar `TokenAuthentication` de Django REST Framework.

**Rationale**:
- Simplicidad de implementación
- Compatibilidad directa con el modelo de Usuario de Django
- Suficiente para el alcance actual del sistema
- No requiere dependencias adicionales

---

### D4: Persistencia de token en localStorage (frontend)

**Contexto**: Se requiere mantener sesión entre recargas de página.

**Decisión**: Almacenar token en `localStorage` bajo la clave `authToken`.

**Rationale**:
- Acceso simple desde JavaScript
- Persiste entre recargas y pestañas del navegador
- Alternativas (sessionStorage) no persisten entre pestañas
- Cookies tienen consideraciones de CSRF que requieren configuración adicional

---

### D5: Token en header Authorization desde frontend

**Contexto**: El frontend debe enviar el token en cada solicitud autenticada.

**Decisión**: El token almacenado bajo la clave `authToken` se enviará en las solicitudes autenticadas mediante el encabezado HTTP `Authorization` con el formato `Authorization: Token <token>`.

**Rationale**:
- Estándar de `TokenAuthentication` de DRF
- Permite enviar el token en cada request de forma consistente
- Compatible con el middleware de autenticación de DRF

---

### D6: Uso de `numero_identificacion` para autenticación

**Contexto**: Django `AbstractUser` usa `username` por defecto, pero el sistema requiere autenticar con número de identificación.

**Decisión**: Personalizar el modelo `Usuario` para usar `numero_identificacion` como campo de autenticación, ignorando el campo `username` de Django.

**Rationale**:
- El número de identificación es el identificador único de los usuarios en el sistema
- Evita mantener un campo `username` redundante
- Consistencia con el modelo de datos institucional

---

### D7: Login público, logout autenticado

**Contexto**: RF-005 requiere que el usuario pueda cerrar sesión de forma explícita, y RF-002 permite iniciar sesión sin sesión previa.

**Decisión**: El endpoint de login es público; el endpoint de logout requiere una sesión autenticada.

**Rationale**:
- Un usuario debe poder iniciar sesión sin estar autenticado previamente (RF-002)
- Solo un usuario con sesión activa puede cerrar sesión (RF-005)
- Alineado con RF-005 (invalidar sesión activa)

---

### D8: Eliminar token en logout (vs discard)

**Contexto**: RF-005 requiere invalidar la sesión al cerrar sesión.

**Decisión**: Eliminar el token de la base de datos en logout.

**Rationale**:
- Garantiza que el token no pueda ser reutilizado
- Es más seguro que simplemente descartarlo en cliente
- Permite auditoría de sesiones cerradas

---

### D9: Visualización de errores de validación del backend en formularios

**Contexto**: Los endpoints POST y PATCH retornan errores de validación en formato campo-mensaje.

**Decisión**: El frontend debe mostrar los errores de validación retornados por el backend en formato `{campo: ["mensaje1", "mensaje2"]}`, asociando cada mensaje al campo correspondiente del formulario. Los errores sin campo específico (`non_field_errors`) deben mostrarse como mensaje global del formulario.

**Rationale**:
- UX consistente: el error se muestra junto al campo que lo origina
- Aprovecha el formato estándar de errores de DRF
- Aplica a todos los formularios que consuman endpoints POST o PATCH

---

## Resumen

| Decisión | Alternativas descartadas | Rationale |
|---|---|---|
| D1: AbstractUser | Crear modelo desde cero | Seguridad, menor código |
| D2: Registro en admin | No registrarlo | Gestión administrativa nativa de Django |
| D3: TokenAuth | JWT, SessionAuth | Simplicidad, integración nativa |
| D4: localStorage | sessionStorage, cookies | Persistencia, simplicidad |
| D5: Header Authorization | Otros esquemas | Estándar DRF, consistencia |
| D6: numero_identificacion para auth | username de Django | Identificador único institucional |
| D7: Login público, logout auth | Ambos públicos/privados | Alineado con RF-002 y RF-005 |
| D8: Eliminar token | Discard-only | Seguridad, auditoría |
| D9: Visualización de errores de validación | Mostrar errores genéricos | UX: error asociado al campo correspondiente |
