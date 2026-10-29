# ANDES — Aplicación Web

Aplicación web del proyecto **ANDES (Aplicaciones Neuquinas de Salud)**, desarrollada con Angular y TypeScript.

ANDES es una plataforma digital de salud que integra herramientas administrativas y asistenciales, incluyendo la Historia Unificada Digital de Salud (HUDS), la gestión de pacientes, agendas, turnos y prestaciones.

Este repositorio contiene la aplicación web y las librerías Angular compartidas que se desarrollan dentro del mismo workspace.

## Tecnologías principales

| Tecnología | Versión / descripción |
|---|---|
| Angular | 15.2.x |
| Angular CLI | 15.2.x |
| TypeScript | 4.9.x |
| Node.js | 18.x / 20.x, según el entorno |
| RxJS | Compatible con Angular 15 |
| Plex | `@andes/plex` 9.x (beta durante la migración) |
| ng-packagr | 15.2.x |

Las versiones exactas de las dependencias se encuentran en `package.json` y `package-lock.json`.

## Requisitos

Para desarrollar localmente se necesita:

- Node.js y npm.
- Git.
- Acceso a una instancia de ANDES API para las funcionalidades que requieren servicios backend.

Se recomienda utilizar Node.js 20 para el desarrollo local y mantener la versión configurada en CI para los builds automatizados.

No es necesario instalar Angular CLI globalmente: los comandos pueden ejecutarse mediante `npx`.

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/andes/app.git
cd app
```

Instalar las dependencias:

```bash
npm ci
```

`npm ci` instala las versiones registradas en `package-lock.json` y es el método recomendado para instalaciones reproducibles.

Para modificar dependencias y actualizar el archivo de bloqueo, utilizar `npm install` según corresponda.

## Configuración del entorno

La aplicación utiliza archivos de configuración de Angular para definir las conexiones con los servicios y otros parámetros de ejecución.

Antes de iniciar el proyecto, verificar los archivos correspondientes dentro de:

```text
src/environments/
```

La configuración debe apuntar a una instancia accesible de ANDES API.

No incluir credenciales, tokens ni información sensible en archivos versionados.

## Desarrollo local

Iniciar el servidor de desarrollo:

```bash
npx ng serve
```

Por defecto, Angular utiliza:

```text
http://localhost:4200
```

Los cambios realizados sobre el código fuente se recompilan automáticamente durante el desarrollo.

## Compilación

Compilar la aplicación:

```bash
npx ng build
```

Los archivos generados se almacenan en el directorio:

```text
dist/
```

Para revisar configuraciones de compilación disponibles, consultar `angular.json`.

Los archivos generados no deben incorporarse al repositorio Git.

## Estructura del proyecto

```text
andes/app/
├── .github/
│   └── workflows/
├── projects/
│   ├── shared/
│   ├── auth/
│   ├── form-builder/
│   └── ...
├── src/
│   ├── app/
│   ├── assets/
│   └── environments/
├── angular.json
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

### Aplicación

El directorio `src/app/` contiene los módulos, componentes, servicios y funcionalidades propias de ANDES.

Entre sus principales áreas funcionales se encuentran:

- MPI: identificación y gestión de pacientes.
- RUP: Registro Universal de Prestaciones.
- HUDS: Historia Unificada Digital de Salud.
- CITAS: gestión de agendas y turnos.
- COM: gestión de comunicaciones y derivaciones.
- Internación y mapa de camas.
- Otras funcionalidades administrativas y asistenciales.

### Librerías Angular

El directorio `projects/` contiene librerías que se desarrollan junto con ANDES.

Estas librerías pueden compilarse de manera independiente y distribuirse como paquetes npm.

Por ejemplo:

| Librería | Descripción |
|---|---|
| `shared` | Servicios, componentes, pipes, directivas y utilidades compartidas |
| `auth` | Funcionalidades de autenticación y contexto de usuario |
| `form-builder` | Herramientas relacionadas con la construcción de formularios |

Cada librería debe conservar su independencia respecto del código específico de `src/app/`.

## Desarrollo y mantenimiento de librerías

Las modificaciones de las librerías incluidas en `projects/` deben realizarse en este repositorio, mediante pull requests.

Para compilar `@andes/shared`:

```bash
npx ng build shared
```

El paquete se genera en:

```text
dist/shared/
```

Antes de integrar cambios que afecten a esta librería, se recomienda ejecutar:

```bash
npx ng build shared
(cd dist/shared && npm pack --dry-run)
npx ng build
```

Esto verifica tanto la compilación independiente de la librería como la compatibilidad con la aplicación.

**Importante:** el build de ANDES puede limpiar el directorio `dist/` y eliminar los artefactos generados previamente para las librerías.

Para publicar una librería, debe compilarse nuevamente desde el commit integrado que corresponda a la versión.

### Documentación de las librerías

- [`@andes/shared`](./projects/shared/README.md)
- [Historial de cambios de Shared](./projects/shared/CHANGELOG.md)
- [Guía de migración de Shared](./projects/shared/MIGRATION.md)

## Pruebas y calidad de código

El proyecto utiliza las herramientas de verificación configuradas en `package.json` y `angular.json`.

Para ejecutar el lint, cuando esté disponible en la configuración del proyecto:

```bash
npm run lint
```

Para ejecutar las pruebas unitarias de una librería:

```bash
npx ng test shared
```

Antes de integrar un cambio, es recomendable ejecutar las comprobaciones correspondientes y validar las funcionalidades afectadas.

## Docker

El repositorio dispone de un `Dockerfile` para la construcción de imágenes de la aplicación.

Construcción de la imagen:

```bash
docker build -t andesnqn/app .
```

La ejecución del contenedor depende de la configuración definida en el `Dockerfile`, incluyendo el puerto expuesto, el comando de inicio y los parámetros del entorno.

Consultar el `Dockerfile` y los procedimientos de despliegue vigentes antes de utilizar la imagen en producción.

## Contribuciones

El desarrollo de ANDES se realiza mediante ramas de trabajo y pull requests.

Se recomienda:

1. Crear una rama a partir de la rama principal actualizada.
2. Implementar los cambios manteniendo los criterios de estilo existentes.
3. Ejecutar las comprobaciones de compilación y validación correspondientes.
4. Documentar los cambios relevantes, especialmente si afectan a librerías públicas.
5. Crear un pull request para su revisión.

Los cambios que introduzcan incompatibilidades en una librería deben reflejarse en su documentación de migración y en su historial de versiones.

## Documentación y enlaces

- [Organización ANDES en GitHub](https://github.com/andes)
- [Repositorio de ANDES API](https://github.com/andes/api)
- [Repositorio de Plex](https://github.com/andes/plex)
- [Documentación de Angular](https://angular.dev/)
- [Guía de desarrollo de ANDES](https://github.com/andes/app/wiki)

## Licencia

Consultar la información de licencia y las condiciones de distribución aplicables al proyecto ANDES.