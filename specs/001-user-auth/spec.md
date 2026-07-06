# Especificación Funcional: Autenticación de Usuario

**Rama de feature**: `001-user-auth`  
**Creado**: 2026-03-20  
**Estado**: Borrador  
**Entrada**: Historias de Usuario de Autenticación para SIGED

## Escenarios de Usuario y Pruebas *(obligatorio)*

### Historia de Usuario 1 - Inicio de Sesión (Prioridad: P1)

**Como** usuario del sistema, **deseo** iniciar sesión con mis credenciales **para** acceder al sistema de manera controlada.

**Escenarios de Aceptación**:

1. **Dado** que el usuario se encuentra en la pantalla de inicio de sesión y registra credenciales válidas correspondientes a una cuenta activa, **Cuando** selecciona la opción “Iniciar sesión”, **Entonces** el sistema autentica al usuario, inicia su sesión y redirige automáticamente a la pantalla Home.

2. **Dado** el usuario intenta iniciar sesión con credenciales incorrectas, **Cuando** el usuario ingresa un número de identificación o contraseña inválidos, **Entonces** el sistema muestra un mensaje de error indicando credenciales inválidas y deniega el acceso.

3. **Dado** el usuario intenta iniciar sesión sin proporcionar credenciales, **Cuando** el usuario deja los campos vacíos y envía el formulario, **Entonces** el sistema muestra mensajes de error indicando que los campos son obligatorios.

4. **Dado** el usuario existe en el sistema pero su cuenta está inactiva, **Cuando** el usuario intenta iniciar sesión con credenciales correctas, **Entonces** el sistema muestra un mensaje de error indicando que la cuenta está inactiva y deniega el acceso.


### Historia de Usuario 2 - Cierre de Sesión (Prioridad: P1)

**Como** usuario autenticado, **deseo** cerrar sesión **para** finalizar de manera segura mi acceso al sistema.

**Escenarios de Aceptación**:

1. **Dado** el usuario tiene una sesión activa, **Cuando** el usuario solicita cerrar sesión de forma explícita, **Entonces** el sistema termina la sesión y redirige automáticamente al usuario a la página de inicio de sesión.

2. **Dado** el usuario ha cerrado la sesión, **Cuando** el usuario intenta acceder a cualquier funcionalidad protegida del sistema, **Entonces** el sistema deniega el acceso y redirige automáticamente a la página de inicio de sesión.


## Requisitos *(obligatorio)*

### Requisitos Funcionales

- **RF-001**: El sistema DEBE validar el número de identificación y la contraseña como campos obligatorios antes de procesar el inicio de sesión.
- **RF-002**: El sistema DEBE verificar que las credenciales ingresadas correspondan a un usuario registrado con cuenta activa y, si la autenticación es exitosa, iniciar la sesión y redirigir automáticamente al usuario a la pantalla Home.
- **RF-003**: El sistema DEBE mostrar un mensaje de error claro y comprensible cuando las credenciales sean inválidas.
- **RF-004**: El sistema DEBE mostrar un mensaje de error claro y comprensible cuando la cuenta del usuario esté inactiva.
- **RF-005**: El sistema DEBE permitir al usuario cerrar sesión de forma explícita mediante una opción visible en la interfaz autenticada, invalidar la sesión activa y redirigir automáticamente al usuario a la pantalla de inicio de sesión.
- **RF-006**: El sistema DEBE denegar el acceso a cualquier pantalla autenticada si no existe una sesión válida y redirigir automáticamente al usuario a la pantalla de inicio de sesión al intentar acceder a funcionalidades protegidas sin autenticación.


### Entidades Clave *(incluir si la funcionalidad involucra datos)*

- **Usuario**: Representa a los usuarios del sistema con atributos de autenticación.
- **Token**: Representa el token de autenticación del usuario para acceso a APIs.
