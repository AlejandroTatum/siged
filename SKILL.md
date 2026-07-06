---
name: spec-rules
description: "Toda app debe cumplir, en la implementación de frontend y backend, las siguientes reglas de especificación, a fin de asegurar la calidad, consistencia y mantenibilidad del código."
---

# Skill: Especificación con reglas a cumplir

## Backend

1. Los mensajes retornados por el backend deben seguir un formato consistente, ser descriptivos y estar redactados en **español**, con el fin de facilitar al usuario la comprensión de los errores y de las alertas generadas por el sistema.

## Frontend

1. Las **URLs** consumidas por el **frontend** deben corresponder exactamente a los **endpoints del backend**, sin omitir ni alterar prefijos ni segmentos de la ruta, y deben declararse de forma centralizada en `frontend/src/config/endpoints.ts` para su reutilización en los componentes.

2. Las **constantes globales** del frontend deben definirse y obtenerse desde el archivo `frontend/src/config/app.ts`, según corresponda a su uso en la interfaz de usuario o en los componentes, a fin de centralizar la configuración, promover la reutilización y evitar la duplicación de información y el uso de valores hardcodeados en la aplicación.

3. Se debe reutilizar la estructura base en todas las pantallas posteriores al inicio de sesión, con el fin de mantener una organización visual uniforme en todo el sistema. Esta estructura DEBE incluir la **barra superior**, el **menú lateral desplegable**, el **área principal de contenido** y el **footer**. Asimismo, los colores de estos elementos deben aplicarse exclusivamente mediante las claves definidas en el **tema centralizado CSS**, en particular: `header-top`: para la barra superior, `sidebar` para el menú lateral desplegable, `sidebar-active`: para la opción activa del menú lateral, `sidebar-hover`: para el estado hover de las opciones del menú lateral. No se debe sustituir estas claves por valores hardcodeados ni por equivalencias declaradas directamente en los componentes.

4. El **bloque principal de encabezado** de cada pantalla debe mantener un estilo uniforme, con el fin de asegurar consistencia en la experiencia de uso. Para ello, su diseño debe aplicarse exclusivamente mediante las claves definidas en el **tema centralizado CSS**, utilizando `heading-block` ara el bloque principal de encabezado y `heading-block-border` para su borde superior. No se debe sustituir estas claves por valores hardcodeados ni por equivalencias declaradas directamente en los componentes.

5. En todas las **tablas**, los nombres de las columnas deben mostrarse en mayúsculas; el **campo de búsqueda** debe ubicarse a la izquierda y el botón **Nuevo** a la derecha; además, el componente de **paginación** debe permanecer visible incluso cuando exista una sola página de resultados.

6. Todos los **campos obligatorios** en la interfaz de usuario deben identificarse visualmente mediante un asterisco **(*)** en color **rojo** y su obligatoriedad debe validarse desde el frontend antes del envío del formulario.

7. Los **íconos** utilizados deben corresponder a la librería **Material Symbols Outlined**, en coherencia con los prototipos definidos para la interfaz de usuario.

8. Todas las interfaces de usuario deben mantener uniformidad visual en todos los componentes, en particular en **bloque principal de encabezado, modales, formularios, botones de acción, campos de búsqueda y tablas, incluyendo sus mecanismos de ordenamiento y paginación**, a fin de asegurar consistencia en la experiencia de uso.

9. En todas las interfaces de usuario se deben aplicar criterios consistentes de **experiencia de usuario, usabilidad y presentación visual**, garantizando navegación clara, jerarquía visual coherente, mensajes comprensibles, retroalimentación visible y una disposición uniforme, limpia y ordenada de los elementos, en concordancia con la identidad visual, los estilos y los componentes definidos en el sistema.

10. Las pantallas deben consumir estrictamente las claves definidas en el **tema centralizado CSS** del proyecto; no se permite su sustitución mediante colores hardcodeados, clases genéricas equivalentes ni valores literales.


