# Constitución de SIGED

**Version**: 1.0.0 | **Ratified**: 2026-03-19 | **Last Amended**: 2026-03-19

## Principios Fundamentales

### I. Calidad del Código

La calidad del código debe garantizar claridad, mantenibilidad y coherencia con el dominio del sistema.

- **Responsabilidad clara**: cada clase, función o componente debe cumplir una responsabilidad bien definida.
- **Consistencia**: la denominación de entidades, atributos, métodos y componentes debe mantenerse uniforme en todo el sistema.
- **Simplicidad**: se debe evitar complejidad innecesaria, duplicación de lógica y estructuras difíciles de mantener.
- **Separación de responsabilidades**: la lógica de presentación, la lógica del dominio y el acceso a datos deben mantenerse diferenciados.
- **Legibilidad**: el código debe ser comprensible por su estructura, nombres y organización.

**Fundamento**: Un código claro y consistente facilita la evolución del sistema, reduce errores y mejora el mantenimiento.

### II. Estándares de Pruebas

Toda funcionalidad implementada debe contar con pruebas que permitan verificar su comportamiento esperado.

- **Pruebas funcionales**: cada funcionalidad debe verificarse frente a sus criterios de aceptación.
- **Pruebas unitarias**: deben cubrir la lógica relevante del dominio y de los servicios.
- **Pruebas de integración**: deben validar la interacción entre componentes cuando corresponda.
- **Casos de error y límite**: las pruebas deben contemplar entradas inválidas, condiciones de frontera y escenarios de fallo.
- **No regresión**: las nuevas implementaciones no deben afectar el comportamiento previamente validado.

**Fundamento**: Las pruebas permiten validar el cumplimiento de los requisitos, prevenir regresiones y dar confianza en la evolución del sistema.

### III. Consistencia de la Experiencia de Usuario

La experiencia de usuario del sistema debe mantenerse coherente en todas las funcionalidades:

- **Adherencia al sistema de diseño**: Los componentes de interfaz deben seguir patrones visuales y estructurales consistentes.
- **Consistencia terminológica**: Los mismos conceptos deben nombrarse de la misma manera en todas las vistas y mensajes del sistema.
- **Patrones de interacción**: La navegación, el manejo de formularios y la retroalimentación al usuario deben seguir criterios uniformes.
- **Presentación de errores**: Los mensajes de error deben ser claros, comprensibles y orientar al usuario sobre cómo proceder.

**Fundamento**: La consistencia en la experiencia de usuario reduce la carga cognitiva, facilita el aprendizaje del sistema y mejora la interacción del usuario con las distintas funcionalidades.

### IV. Requerimientos No Funcionales

La solución desarrollada debe cumplir, como mínimo, con los siguientes requerimientos no funcionales:

- **Seguridad**: requerir autenticación válida para acceder al sistema y restringir el acceso de acuerdo con el rol y el contexto del usuario.
- **Usabilidad**: mantener una interfaz clara, consistente y comprensible en las distintas operaciones del sistema.
- **Mantenibilidad**: respetar la organización modular y por capas definida en la arquitectura general, favoreciendo la claridad y evolución del sistema.
- **Portabilidad**: permitir el uso del sistema en diferentes tamaños de pantalla, conservando legibilidad y funcionalidad.
- **Rendimiento**: ofrecer tiempos de respuesta adecuados en las operaciones habituales y procurar un uso eficiente de los recursos del sistema.

**Fundamento**: Los requerimientos no funcionales condicionan la calidad global de la solución y deben ser considerados desde el diseño y la implementación, no solo al final del desarrollo.


### V. Coherencia del Microdominio

El proyecto se desarrolla sobre un microdominio de un **Sistema de Información y Gestión Educativa (SIGED)**, enfocado en procesos esenciales de **administración institucional y planificación académica**. El alcance del sistema comprende la autenticación de usuarios, la gestión de instituciones educativas y sus autoridades académicas, así como la planificación académica por institución a través de planes de estudio, grados escolares y asignaturas.
 
 Cada microdominio debe mantener consistencia interna y respetar los límites funcionales definidos en el sistema.

**Microdominio: Autenticación**
- La autenticación constituye la única fuente de verdad para la validación de identidad y credenciales.
- La gestión de sesiones debe mantenerse centralizada, evitando lógica de autenticación duplicada.
- La autorización debe definirse en función de roles y responsabilidades.
- Debe existir una separación clara entre autenticación y autorización.

**Microdominio: Gestión Institucional**
- La gestión institucional debe centrarse en la administración de instituciones educativas y en la asignación de la autoridad académica correspondiente.
- Los datos institucionales deben mantenerse consistentes y claramente diferenciados de otros microdominios.
- Las operaciones del microdominio deben responder exclusivamente a su propósito funcional.
- La jerarquía de entidades es: institución → asignaciones de rol.

**Microdominio: Planificación Académica**
- La planificación académica debe estructurarse en función de la institución educativa, sus planes de estudio, los grados escolares y las asignaturas asociadas.
- Las relaciones entre planes de estudio, grados escolares y asignaturas deben preservarse de forma consistente.
- Las operaciones de este microdominio deben respetar la jerarquía y dependencias entre sus elementos.
- La jerarquía de entidades es: institución → plan de estudio → grado escolar → asignatura.

**Reglas transversales entre microdominios**
- Cada microdominio debe mantener responsabilidades claramente delimitadas.
- La interacción entre microdominios debe realizarse de forma controlada, evitando acoplamiento innecesario.
- Las entidades compartidas deben conservar una única fuente de definición dentro del sistema.

**Fundamento**: La delimitación clara de microdominios favorece la coherencia del sistema, reduce el acoplamiento y facilita la evolución ordenada de sus funcionalidades.


## Lineamientos Técnicos

### Estilo arquitectónico

El sistema se concibe bajo un **estilo arquitectónico cliente-servidor** con responsabilidades diferenciadas:

- el **cliente**, responsable de la interacción con el usuario mediante un frontend desacoplado;
- el **servidor**, responsable de la exposición de servicios, el procesamiento de reglas de negocio y la gestión del acceso a los datos;
- la **persistencia**, responsable del almacenamiento relacional de la información del dominio.

### Estructura base del servidor (backend)

El backend debe organizarse de forma modular, siguiendo una arquitectura por capas (Controlador/Servicio/DAO/DTO):

- **Controladores / Vistas**: Gestionan las solicitudes y respuestas HTTP, aplican permisos y validaciones iniciales, utilizan DTO cuando corresponda y delegan la operación a los servicios.
- **Servicios**: Ejecutan la lógica del dominio y coordinan las operaciones funcionales del sistema.
- **DAO**: Gestionan las operaciones de consulta, creación, actualización y eliminación de datos del sistema.
- **DTO**: Estructuran y transfieren los datos de entrada y salida entre capas, evitando exponer directamente las entidades del dominio a los clientes.

La terminología utilizada deberá corresponderse con la tecnología de implementación.

### Estructura base del cliente (frontend)

El frontend debe organizarse de forma modular, permitiendo separar presentación, navegación, estado y comunicación con el servidor:

- UI components, responsables de presentar formularios, tablas, botones, mensajes y vistas funcionales del sistema;
- routers, responsables de controlar la navegación entre vistas y módulos;
- state manager, responsable de mantener el estado global de la aplicación, incluyendo sesión, usuario autenticado y datos compartidos entre vistas;
- API services, responsables de centralizar la comunicación con el backend mediante solicitudes y respuestas estructuradas.

La terminología utilizada deberá corresponderse con la tecnología de implementación.

## Flujo de Trabajo de Desarrollo

- Todo cambio debe partir de una especificación y, cuando corresponda, de un plan técnico previo.
- La implementación debe mantener trazabilidad con los requerimientos, tareas y pruebas asociadas.
- Los cambios realizados deben revisarse en función de su coherencia con la arquitectura, los requerimientos no funcionales y los principios de esta constitución.