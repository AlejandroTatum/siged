# Especificación Funcional: Gestionar Planificación Curricular

**Rama de feature**: `003-planificacion`  
**Creado**: 2026-05-11  
**Estado**: Borrador  
**Entrada**: Historias de Usuario de Planificación Curricular para SIGED

## Escenarios de Usuario y Pruebas

### Historia de Usuario 1 - Visualización de opciones del menú lateral en el contexto institucional (Prioridad: P1)

Como Autoridad académica, deseo que el menú lateral, al estar en el contexto de una institución educativa, muestre únicamente las funcionalidades correspondientes a dicho contexto para navegar de forma clara entre las opciones institucionales.

**Escenarios de Aceptación**:

1. **Dado** que la autoridad académica ha accedido a una institución educativa que le ha sido asignada en estado activa, **Cuando** el sistema carga el menú lateral en el contexto institucional, **Entonces** se muestran las opciones "Volver al menú principal", "Mi institución" y "Planes de estudio".

2. **Dado** que la autoridad académica está en el contexto institucional y selecciona "Volver al menú principal", **Cuando** el sistema procesa la solicitud, **Entonces** retorna al menú lateral del contexto general del sistema.

3. **Dado** que la autoridad académica está en el contexto institucional y selecciona "Mi institución", **Cuando** el sistema procesa la solicitud, **Entonces** redirige al dashboard institucional de la entidad seleccionada.

4. **Dado** que la autoridad académica está en el contexto institucional y selecciona "Planes de estudio", **Cuando** el sistema procesa la solicitud, **Entonces** redirige a la vista de gestión de planes de estudio de la institución seleccionada.


### Historia de Usuario 2 - Gestión de Planes de Estudio (Prioridad: P1)

Como Autoridad académica, deseo gestionar un plan de estudios por institución educativa para adaptar la planificación curricular a las características y necesidades específicas de cada institución.

**Escenarios de Aceptación**:

1. **Dado** que la autoridad académica tiene acceso al módulo de planificación de una institución, **cuando** accede a la lista de planes de estudio, **entonces** el sistema muestra todos los planes de estudio registrados con su información básica y estado de vigencia, presentadas de forma paginada, con navegación entre páginas y soporte de ordenamiento por las columnas nombre y estado; y búsqueda por nombre.

2. **Dado** que la autoridad académica está en el formulario de creación de plan de estudios, **cuando** ingresa los datos requeridos y guarda, **entonces** el sistema crea el plan de estudios y muestra un mensaje de confirmación de creación exitosa.

3. **Dado** que la autoridad académica está en el formulario de edición de un plan de estudios existente, **cuando** modifica los datos y guarda, **entonces** el sistema actualiza la información y muestra un mensaje de confirmación de actualización exitosa.

4. **Dado** que la autoridad académica selecciona un plan de estudios para eliminar, **cuando** confirma la eliminación en el mensaje de confirmación, **entonces** el sistema elimina el plan de estudios y muestra un mensaje de confirmación de eliminación exitosa.

5. **Dado** que la autoridad académica intenta crear un segundo plan de estudios vigente para la misma institución, **cuando** guarda el nuevo plan, **entonces** el sistema muestra un mensaje de error indicando que solo puede existir un plan vigente por institución.


### Historia de Usuario 3 - Gestión de Grados Escolares (Prioridad: P1)

Como Autoridad académica, deseo gestionar los grados escolares para cada plan de estudios para estructurar correctamente la organización académica de la institución.

**Escenarios de Aceptación**:

1. **Dado** que la autoridad académica está en la vista de un plan de estudios, **cuando** accede a la sección de grados escolares, **entonces** el sistema muestra la lista de grados escolares registrados con su información básica, presentadas de forma paginada, con navegación entre páginas y soporte de ordenamiento por las columnas nombre, orden, nivel y subnivel; y búsqueda por nombre.

2. **Dado** que la autoridad académica está en el formulario de creación de grado escolar, **cuando** ingresa los datos requeridos y guarda, **entonces** el sistema crea el grado escolar vinculado al plan y muestra un mensaje de confirmación.

3. **Dado** que la autoridad académica está en el formulario de edición de un grado escolar existente, **cuando** modifica los datos y guarda, **entonces** el sistema actualiza la información y muestra un mensaje de confirmación de actualización exitosa.

4. **Dado** que la autoridad académica selecciona un grado escolar para eliminar, **cuando** confirma la eliminación en el mensaje de confirmación, **entonces** el sistema elimina el grado escolar y muestra un mensaje de confirmación de eliminación exitosa.

5. **Dado** que la autoridad académica está creando o editando un grado escolar,  **cuando** selecciona un nivel educativo que dispone de subniveles **entonces** el sistema exige la selección del subnivel educativo correspondiente.


### Historia de Usuario 4 - Gestión de Asignaturas (Prioridad: P1)

Como Autoridad académica, deseo gestionar las asignaturas por cada grado escolar para asegurar que cada grado tenga las asignaturas que debe impartir según la normativa educativa.

**Escenarios de Aceptación**:

1. **Dado** que la autoridad académica está en la vista de un grado escolar, **cuando** accede a la sección de asignaturas, **entonces** el sistema muestra la lista de asignaturas registradas con su información básica.

2. **Dado** que la autoridad académica está en el formulario de creación de asignatura, **cuando** ingresa los datos requeridos y guarda, **entonces** el sistema crea la asignatura vinculada al grado y muestra un mensaje de confirmación.

3. **Dado** que la autoridad académica está en el formulario de edición de una asignatura existente, **cuando** modifica los datos y guarda, **entonces** el sistema actualiza la información y muestra un mensaje de confirmación de actualización exitosa.

4. **Dado** que la autoridad académica selecciona una asignatura para eliminar, **cuando** confirma la eliminación en el mensaje de confirmación, **entonces** el sistema elimina la asignatura y muestra un mensaje de confirmación de eliminación exitosa.

5. **Dado** que la autoridad académica visualiza un grado escolar, **cuando** la suma de la carga pedagógica de sus asignaturas no alcance la carga pedagógica mínima semanal exigida por el subnivel educativo correspondiente o, en su defecto, por el nivel educativo del grado, **entonces** el sistema debe mostrar una alerta de incumplimiento.


## Requisitos

### Requisitos Funcionales

- **RF-001**: El sistema DEBE mostrar en el menú lateral, dentro del contexto de una institución educativa, únicamente las funcionalidades correspondientes a dicho contexto, incluyendo las opciones "Volver al menú principal", "Mi institución" y "Planes de estudio".
- **RF-002**: El sistema DEBE permitir listar todos los planes de estudio asociados a una institución educativa de forma paginada, permitir la navegación entre páginas y soportar el ordenamiento por las columnas nombre y estado.
- **RF-003**: El sistema DEBE permitir buscar planes de estudio por nombre asociados a una institución educativa.
- **RF-004**: El sistema DEBE permitir crear un nuevo plan de estudio para una institución educativa ingresando los datos obligatorios.
- **RF-005**: El sistema DEBE permitir editar la información de un plan de estudio existente.
- **RF-006**: El sistema DEBE solicitar confirmación antes de eliminar un plan de estudio y ejecutar la eliminación únicamente cuando dicha confirmación haya sido aceptada.
- **RF-007**: El sistema DEBE garantizar que solo exista un plan de estudio vigente por institución educativa.
- **RF-008**: El sistema DEBE permitir listar todos los grados escolares asociados a un plan de estudio de forma paginada, permitir la navegación entre páginas y soportar el ordenamiento por las columnas nombre, orden, nivel y subnivel.
- **RF-009**: El sistema DEBE permitir buscar grados escolares por nombre asociados a un plan de estudio.
- **RF-010**: El sistema DEBE permitir crear un nuevo grado escolar ingresando los datos obligatorios, asociándolo a un nivel educativo y exigiendo la selección de un subnivel educativo cuando el nivel seleccionado disponga de ello.
- **RF-011**: El sistema DEBE permitir editar la información de un grado escolar existente, manteniendo la obligatoriedad del nivel educativo y, cuando corresponda, del subnivel educativo.
- **RF-012**: El sistema DEBE solicitar confirmación antes de eliminar un grado escolar y ejecutar la eliminación únicamente cuando dicha confirmación haya sido aceptada.
- **RF-013**: El sistema DEBE permitir listar todas las asignaturas asociadas a un grado escolar.
- **RF-014**: El sistema DEBE permitir crear una nueva asignatura ingresando los datos obligatorios y la carga pedagógica correspondiente.
- **RF-015**: El sistema DEBE permitir editar la información de una asignatura existente.
- **RF-016**: El sistema DEBE solicitar confirmación antes de eliminar una asignatura y ejecutar la eliminación únicamente cuando dicha confirmación haya sido aceptada.
- **RF-017**: El sistema DEBE mostrar una alerta en la vista del grado escolar cuando la suma de la carga pedagógica de sus asignaturas sea inferior a la carga pedagógica mínima semanal definida para el subnivel educativo correspondiente o, en su defecto, para el nivel educativo.


### Entidades Clave

- **PlanEstudio**: Representa a planificación curricular de una institución educativa.
- **EducacionNivel**: Representa los niveles educativos del sistema.
- **EducacionSubNivel**: Representa los subniveles educativos asociados a un nivel educativo.
- **GradoEscolar**: Representa un grado o año escolar dentro de un plan de estudio. Se asocia obligatoriamente a un nivel educativo y, cuando corresponda, a un subnivel educativo.
- **Asignatura**: Representa una asignatura impartida en un grado escolar.
