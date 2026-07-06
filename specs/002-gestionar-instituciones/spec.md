# Especificación Funcional: Gestionar Instituciones Educativas y Autoridades Académicas

**Rama de feature**: `002-gestionar-instituciones`  
**Creado**: 2026-03-22  
**Estado**: Borrador  
**Entrada**: Historias de Usuario de Gestionar Instituciones educativas y asignar autoridades para SIGED

## Escenarios de Usuario y Pruebas 

### Historia de Usuario 1 - Visualización de opciones del menú lateral según roles activos (Prioridad: P1)

Como usuario autenticado, deseo que el menú lateral muestre las opciones correspondientes a mis roles activos para acceder de forma rápida y clara a las funcionalidades que tengo habilitadas.

**Escenarios de Aceptación**:

1. **Dado** que un usuario con rol ADMINISTRADOR activo ha iniciado sesión exitosamente, **Cuando** el sistema carga el menú lateral, **Entonces** se muestra la opción "Instituciones" en el menú.

2. **Dado** que un usuario con rol AUTORIDAD_ACADEMICA activo ha iniciado sesión exitosamente, **Cuando** el sistema carga el menú lateral, **Entonces** se muestra la opción "Mis instituciones" en el menú.

3. **Dado** que un usuario ha iniciado sesión exitosamente con múltiples roles activos, incluidos ADMINISTRADOR y AUTORIDAD_ACADEMICA, **Cuando** el sistema carga el menú lateral, **Entonces** se muestran todas las opciones disponibles a sus roles activos.

### Historia de Usuario 2 - Gestión de Instituciones Educativas (Prioridad: P1)

Como Administrador, deseo gestionar los datos de las instituciones educativas para mantener actualizada la información de las instituciones educativas administradas por el sistema.

**Escenarios de Aceptación**:

1. **Dado** que el Administrador tiene acceso al módulo de instituciones, **Cuando** accede a la lista de instituciones educativas, **Entonces** el sistema muestra todas las instituciones registradas con su información básica y autoridades académicas activas, presentadas de forma paginada, con navegación entre páginas y soporte de ordenamiento por las columnas nombre, código y RUC.

2. **Dado** que el Administrador está en el formulario de creación de institución, **Cuando** ingresa los datos requeridos y guarda, **Entonces** el sistema crea la institución y muestra un mensaje de confirmación de creación exitosa.

3. **Dado** que el Administrador está en el formulario de edición de una institución existente, **Cuando** modifica los datos y guarda, **Entonces** el sistema actualiza la información y muestra un mensaje de confirmación de actualización exitosa.

4. **Dado** que el Administrador selecciona una institución para eliminar, **Cuando** confirma la eliminación en el mensaje de confirmación, **Entonces** el sistema elimina la institución y muestra un mensaje de confirmación de eliminación exitosa.

5. **Dado** que el Administrador ingresa un término de búsqueda en el campo de búsqueda de instituciones, **Cuando** presiona el botón de buscar, **Entonces** el sistema muestra únicamente las instituciones cuyo nombre contiene el término buscado.


### Historia de Usuario 3 - Asignación de Autoridades Académicas (Prioridad: P1)

Como Administrador, deseo asignar autoridades académicas a una institución educativa para formalizar la vinculación institucional que define su ámbito de operación dentro del sistema.

**Escenarios de Aceptación**:

1. **Dado** que el Administrador está en la vista de lista de instituciones, **Cuando** accede a la sección de autoridades académicas de una institución, **Entonces** el sistema muestra la lista de autoridades académicas asignadas a dicha institución.

2. **Dado** que el Administrador está en la sección de autoridades académicas de una institución, **Cuando** selecciona agregar una nueva autoridad y proporciona los datos requeridos, **Entonces** el sistema asigna la autoridad académica a la institución y la muestra en la lista.

3. **Dado** que el Administrador está editando una asignación de autoridad académica existente, **Cuando** modifica el usuario y guarda, **Entonces** el sistema actualiza la información de la asignación de autoridad académica y refleja los cambios en la lista.

4. **Dado** que el Administrador está en la lista de autoridades académicas de una institución, **Cuando** selecciona eliminar una asignación de autoridad y confirma la eliminación, **Entonces** el sistema elimina la asignación de autoridad académica de la institución y refleja los cambios en la lista..

5. **Dado** que el Administrador selecciona una asignación de autoridad académica activa, **cuando** cambia su estado, **entonces** el sistema desactiva la asignación de la autoridad académica.

6. **Dado** que el Administrador selecciona una asignación de autoridad académica inactiva, **cuando** cambia su estado, **entonces** el sistema activa la asignación de la autoridad académica.


### Historia de Usuario 4 - Acceso Restringido por Institución Asignada (Prioridad: P1)

Como Autoridad académica, deseo acceder únicamente a las instituciones educativas que me han sido asignadas para gestionar exclusivamente la información académica correspondiente a cada contexto institucional.

**Escenarios de Aceptación**:

1. **Dado** que una autoridad académica tiene una asignación activa a una institución educativa, **cuando** accede al sistema, **entonces** el sistema le permite ver la institución asignada.

2. **Dado** que una autoridad académica no tiene una asignación activa a una institución educativa, **cuando** inicia sesión, **entonces** el sistema no le habilita acceso operativo a la institución.


## Requisitos

###  Requisitos Funcionales

- **RF-001**: El sistema DEBE mostrar en el menú lateral todas las funcionalidades habilitadas de acuerdo con los roles activos del usuario autenticado, incluyendo la opción Instituciones para el rol ADMINISTRADOR y la opción Mis instituciones para el rol AUTORIDAD_ACADEMICA.
- **RF-002**: El sistema DEBE permitir listar todas las instituciones educativas registradas con su información básica y autoridades académicas activas, de forma paginada, permitir la navegación entre páginas y soportar el ordenamiento por las columnas nombre, código y RUC.
- **RF-003**: El sistema DEBE permitir crear una nueva institución educativa ingresando los datos obligatorios definidos para su registro.
- **RF-004**: El sistema DEBE permitir editar la información de una institución educativa existente.
- **RF-005**: El sistema DEBE solicitar confirmación antes de eliminar una institución educativa y ejecutar la eliminación únicamente cuando dicha confirmación haya sido aceptada.
- **RF-006**: El sistema DEBE permitir buscar instituciones educativas por nombre.
- **RF-007**: El sistema DEBE permitir listar las asignaciones de autoridades académicas de una institución educativa.
- **RF-008**: El sistema DEBE permitir asignar una o más autoridades académicas a una institución educativa.
- **RF-009**: El sistema DEBE permitir editar el usuario de la asignación de autoridad académica a una institución educativa.
- **RF-010**: El sistema DEBE permitir eliminar la asignación de una autoridad académica respecto de una institución educativa.
- **RF-011**: El sistema DEBE permitir activar y desactivar una asignación de autoridad académica por institución.
- **RF-012**: El sistema DEBE permitir que una autoridad académica acceda únicamente a las instituciones educativas que le han sido asignadas, mostrándolas exclusivamente cuando dichas asignaciones se encuentren activas.


### Entidades Clave

- **Institución Educativa**: Representa una institución educativa administrada por el sistema.
- **Usuario**: Representa a una persona registrada en el sistema susceptible de tener uno o más roles.
- **Rol**: Representa el tipo de rol que puede asumir un usuario dentro del sistema, tales como `ADMINISTRADOR`, `AUTORIDAD_ACADEMICA`, `DOCENTE`, `SECRETARIA`, `ESTUDIANTE` y `DECE`. En esta funcionalidad, interesan especialmente `ADMINISTRADOR` y `AUTORIDAD_ACADEMICA`.
- **UsuarioRol**: Representa la asignación de un rol a un usuario y, cuando el rol lo requiere, su vinculación con una institución educativa. En esta funcionalidad, dicha vinculación es obligatoria para el rol de `AUTORIDAD_ACADEMICA`.