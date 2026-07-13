# Guía de trabajo para agentes — SIGED

**Última actualización:** 2026-03-24

## Propósito

Este archivo establece lineamientos generales para la ejecución de tareas por agentes para la implementación del proyecto **SIGED**.  

## Modo de entrega académica local

SIGED se desarrolla como un proyecto académico. Los specs entregados por el docente son la autoridad funcional y de seguridad.

Durante la implementación de una feature:

- no se deben crear PRs ni cadenas de PRs;
- no se deben exigir receipts, review gates ni provenance de Gentle AI;
- no se deben aplicar controles de entrega orientados a producción que no formen parte de los specs;
- la verificación obligatoria consiste en migraciones, pruebas de backend, pruebas de frontend, build y aceptación manual contra el spec;
- una feature se considera terminada solo cuando esa evidencia académica está en verde;
- después de verificar la feature, los cambios se organizan en commits convencionales, sin atribución de IA.

Las PRs, revisiones adversariales y validaciones de Gentle AI son opcionales y solo se ejecutan cuando el usuario las solicita explícitamente. Este modo simplifica el proceso de entrega; no permite omitir requisitos funcionales, pruebas relevantes, autorización, aislamiento de datos ni otras exigencias de seguridad definidas por los specs.

## Tecnologías activas

- **Backend:** Python 3.11
- **Framework backend:** Django 4.x
- **API:** Django REST Framework
- **Autenticación:** `TokenAuthentication`
- **Base de datos:** SQLite mediante Django ORM
- **Frontend:** React
- **Framework de estilos frontend:** Tailwind CSS, con paleta de colores centralizada mediante variables reutilizables.
- **Pruebas:** Django `TestCase` y `pytest`

## Organización modular

- **`core`**
- **`organizacion`**

## Estructura del proyecto

La implementación debe mantenerse dentro del directorio raíz del proyecto `siged/`. 

- el **backend** debe ubicarse en la carpeta `backend/`;
- el **frontend** debe ubicarse en la carpeta `frontend/`;

```text
siged/
├── backend/
│   ├── apps/
│   │   ├── core/
│   │   └── organizacion/
│   ├── config/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   └── router/
│   └── package.json
└── docs/
```

## Configuraciones de implementación en el backend

### Estructura esperada del backend

Cada app del backend debe mantener la siguiente organización modular:

```text
apps/
└── <nombre_app>/
    ├── models.py
    ├── apis/
    │   ├── urls.py
    │   ├── views.py
    │   └── serializers/
    │       └── <entidad>_serializer.py
    ├── servicios/
    │   └── <entidad>_servicio.py
    ├── daos/
    │   └── <entidad>_dao.py
    ├── permisos.py
    ├── excepciones.py
    └── tests.py

```

Esta estructura por app o módulo considera:

- models.py, para representar la información del dominio;
- views.py, para exponer endpoints y gestionar solicitudes y respuestas HTTP;
- serializers/<entidad>_serializer.py, actuarán como DTOs para transformar datos de entrada y salida;
- servicios/<entidad>_servicio.py, para implementar la lógica de negocio;
- daos/<entidad>_dao.py, para gestionar el acceso a datos;
- permisos.py, para controlar el acceso a los endpoints cuando corresponda;
- excepciones.py, para manejar restricciones y verificaciones transversales;
- tests.py, para verificar el cumplimiento de la funcionalidad específica;

Los componentes de esta estructura deben comunicarse respetando una separación clara de responsabilidades:

- las **views** no deben contener lógica de acceso directo a datos ni reglas de negocio;
- las **views** deben apoyarse en los **permisos** para validar el acceso a los endpoints;
- las **views** deben utilizar los **serializers** correspondientes para validar y transformar la información;
- las **views** deben invocar los **servicios** para ejecutar la lógica de negocio;
- los **servicios** deben utilizar los **daos** para el acceso a datos;
- los **permisos** o **serializers**  pueden apoyarse en los daos u otros componentes reutilizables;
- **Importante** no debe duplicarse código relacionado con el acceso a datos, la lógica de negocio, la validación o la autorización en múltiples puntos de la implementación; para ello, debe promoverse la reutilización de funciones o componentes equivalentes.

Dentro de las estructuras **serializers**, **servicios** y **daos**, la implementación deberá organizarse por entidad del dominio. Cada entidad deberá contar con su propio archivo o componente equivalente, evitando concentrar múltiples entidades en una sola unidad de implementación.


### Comandos de trabajo del backend

El backend debe trabajarse con un **entorno virtual** activo para aislar las dependencias del proyecto. Todos los comandos del backend deben ejecutarse desde la carpeta `backend/`.

Flujo base de preparación:

- `cd backend`
- `python -m venv .venv`
- `source .venv/bin/activate`
- `pip install -r requirements.txt`

Comandos de trabajo habituales:

- `python manage.py makemigrations`
- `python manage.py migrate`
- `python manage.py runserver`
- `python manage.py test`
- `pytest`

### Configuraciones base del backend

**Panel de administración**
El backend debe habilitar el panel de administración de Django dentro de la configuración principal de rutas. En el archivo `urls.py` debe registrarse la ruta del administrador mediante:
  - `path("admin/", admin.site.urls),`

**Configuración CORS**
El archivo `settings.py` del backend debe incluir la configuración de CORS para permitir la comunicación controlada con el frontend en los entornos definidos del proyecto.
  - Debe instalarse la dependencia correspondiente mediante `pip install django-cors-headers` en el entorno virtual.
  - Debe registrarse la aplicación `"corsheaders"` en `INSTALLED_APPS`.
  - Debe incorporarse `corsheaders.middleware.CorsMiddleware` en `MIDDLEWARE`, antes de `CommonMiddleware`.
  - Debe definirse la lista de orígenes permitidos en `CORS_ALLOWED_ORIGINS` y las demás configuraciones necesarias según el entorno y el mecanismo de autenticación utilizado.

**Superusuario**
Debe crearse un `superusuario` en el backend para el acceso inicial al panel de administración mediante el comando `python manage.py createsuperuser`, utilizando los siguientes datos:
  - `username = "admin"`
  - `email = "admin@example.com"`
  - `password = "admin123"`
  - `numero_identificacion = "000000001"`
  - `is_superuser = True`
  - `is_staff = True`
  - `is_active = True`
  - `first_name = "Administrador"`
  - `last_name = "Sistema"`

## Configuraciones de implementación en el frontend

### Estructura esperada del frontend

Cada feature del frontend debe mantener la siguiente organización:

```text
features/
└── <nombre_feature>/
    ├── pages/
    ├── components/
    ├── services/
    ├── hooks/
    ├── types/
    └── utils/
```

### Comandos de trabajo del frontend

El frontend debe inicializarse como un proyecto Node/React válido dentro de la carpeta `frontend/`. Al tratarse de una implementación desde cero, debe generarse obligatoriamente el archivo `package.json` y deben instalarse las dependencias correspondientes. No se considera correctamente inicializado un frontend que no disponga de `package.json`.

Flujo base de preparación:

- `cd frontend`
- `npm create vite@latest .`
- `npm install`

Comandos de trabajo habituales:

- `npm run dev`
- `npm test`

### Configuraciones base del frontend

**URL base del backend**
La URL base del backend en `vite.config.ts` debe centralizarse en una única variable y reutilizarse en todas las rutas configuradas, por ejemplo:

- `const backend_url = 'http://localhost:8000'`

**Puerto fijo del frontend**  
El frontend debe ejecutarse en un puerto fijo y predefinido durante el desarrollo, el cual debe definirse explícitamente en la configuración del proyecto, por ejemplo en `vite.config.ts`.

- Ejemplo: `server: { port: 3000 }`

**Constantes reutilizables del frontend**
Las constantes globales y reutilizables del frontend deben centralizarse en un **único archivo** ubicado en la ruta `frontend/src/config/app.ts`. En este módulo se incluirán, entre otros, los textos institucionales globales del sistema, como la sigla y el nombre completo de la aplicación, así como otros valores compartidos que deban reutilizarse en distintas funcionalidades.

- `const app_name = 'SIGED'`
- `const app_full_name = 'Sistema de Información y Gestión Educativa'`

**Consistencia y centralización de endpoints**
Los endpoints del frontend deben declararse en el archivo `frontend/src/config/endpoints.ts`. Cada funcionalidad debe reutilizar este módulo común y no debe declarar rutas de forma aislada ni duplicar constantes equivalentes en servicios, componentes, hooks o utilidades. 

### Estilos del frontend

- El frontend debe utilizar **Tailwind CSS** como framework de estilos, a través de un **tema centralizado**, reutilizable y consistente en toda la interfaz, con una paleta de colores.
  - background: "#f3f4f6",
  - surface: "#ffffff",
  - primary: "#4c6ef5",
  - secondary: "#4f00d9",
  - accent: "#6d5efc",
  - success: "#16a34a",
  - warning: "#eab308",
  - danger: "#dc2626",
  - header-top: "#ffffff", para la barra superior
  - sidebar: "#330099", para el menú lateral desplegable
  - sidebar-active: "#7399FF", para la opción activa del menú lateral
  - sidebar-hover: "#6488EE", para el estado hover de las opciones del menú lateral
  - heading-block: "#F8FAFC", para el bloque principal de encabezado
  - heading-block-border: "#4c6ef5", para el borde superior del bloque principal de encabezado
- Los **íconos** deberán corresponder a la librería **Material Symbols Outlined**.


## Organización por archivo

La nomenclatura de archivos, clases, componentes, atributos y métodos debe seguir las convenciones propias de la tecnología de implementación utilizada, manteniendo uniformidad dentro del proyecto. Para asegurar consistencia en el código, se establece la siguiente organización general:

- los **archivos** deben nombrarse según la convención habitual del entorno tecnológico:
  - en backend, preferentemente en **snake_case**;
  - en frontend React/TypeScript, preferentemente en **camelCase** o **kebab-case**;
- las **clases**, cuando varias se declaren dentro de un mismo archivo, deben organizarse en **orden alfabético** y nombrarse en **PascalCase**;
- los **componentes** en frontend React/TypeScript deben nombrarse en **PascalCase**;
- los **atributos simples** de cada clase deben organizarse en **orden alfabético** y nombrarse en **snake_case**;
- después deben ubicarse los **atributos de relación**, también en **snake_case**, siguiendo este orden:
  - `OneToOneField`
  - `ForeignKey`
  - `ManyToManyField`
- finalmente, los **métodos** o **funciones** deben nombrarse en **snake_case** y organizarse de forma consistente dentro del archivo, preferentemente en **orden alfabético**.

## Features registradas

- 001-user-auth
- 002-gestionar-instituciones
- 003-planificacion
