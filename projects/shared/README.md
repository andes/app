# @andes/shared

Librería Angular que proporciona servicios, componentes, directivas, pipes y utilidades compartidas para el proyecto ANDES.

Actualmente utiliza **Angular 15** y se compila mediante `ng-packagr` con Ivy en modo `partial`, permitiendo su distribución como paquete npm.

## 1. Ubicación y mantenimiento

La librería se desarrolla y mantiene dentro del workspace Angular del repositorio [andes/app](https://github.com/andes/app), en el directorio:

`projects/shared/`

Los cambios deben realizarse mediante pull requests sobre `andes/app`, verificando tanto la compilación independiente de la librería como la compilación de la aplicación.

El repositorio independiente [andes/shared](https://github.com/andes/shared) corresponde a una versión histórica del proyecto y no debe utilizarse como fuente principal de desarrollo, una vez confirmado su desuso.

## 2. Requisitos

- Angular 15.2.x.
- TypeScript 4.9.x.
- `ng-packagr` 15.2.x.
- `@andes/plex` 9.0.0-beta.8 o una versión compatible.

La versión definitiva de `@andes/shared` 7.0.0 estará destinada a utilizar Plex 9 estable.

## 3. Generación de componentes

Para generar un componente dentro de la librería:

```bash
npx ng generate component nombre-componente --project shared
```

También pueden generarse otros elementos:

```bash
npx ng generate directive|pipe|service|class|guard|interface|enum|module nombre --project shared
```

Es importante especificar `--project shared` para evitar que Angular genere los archivos dentro de la aplicación principal.

Los componentes, servicios y pipes que deban formar parte de la API pública de la librería deben exportarse desde:

`projects/shared/src/public-api.ts`

### Independencia de la librería

El código de `projects/shared` no debe importar directamente archivos de `src/app`, ni depender de configuraciones o componentes exclusivos de la aplicación ANDES.

Las funcionalidades específicas de ANDES deben permanecer dentro de `src/app` y declararse en los módulos correspondientes.

## 4. Compilación

Desde la raíz del repositorio `andes/app`:

```bash
npx ng build shared
```

Los archivos generados se almacenan en:

`dist/shared/`

La compilación independiente es obligatoria para validar que la librería pueda empaquetarse correctamente.

También debe verificarse la compilación de la aplicación:

```bash
npx ng build
```

**Importante:** el build de ANDES utiliza el directorio `dist/` y puede eliminar los archivos generados previamente en `dist/shared/`.

Por lo tanto, para empaquetar o publicar la librería debe ejecutarse nuevamente `npx ng build shared` después del build de la aplicación.

## 5. Pruebas

Para ejecutar las pruebas unitarias de la librería mediante Karma:

```bash
npx ng test shared
```

Antes de integrar cambios, se recomienda verificar:

- Compilación independiente de `shared`.
- Compilación de ANDES.
- Funcionamiento de componentes y servicios modificados.
- Compatibilidad con la versión de Plex utilizada.

## 6. Versionado

La librería utiliza [Versionado Semántico](https://semver.org/lang/es/).

Cada versión debe actualizarse en `projects/shared/package.json` y documentarse en `CHANGELOG.md`.

Las publicaciones se identifican mediante tags de Git específicos de la librería:

```text
shared-v7.0.0-beta.1
shared-v7.0.0
```

Estos tags se crean en el repositorio `andes/app` y permiten identificar el commit correspondiente a cada publicación.

## 7. Publicación en npm

La publicación debe realizarse únicamente desde código integrado en la rama principal.

### 7.1. Preparación

Actualizar la rama local y verificar que no existan cambios pendientes:

```bash
git checkout master
git pull --ff-only origin master
git status
```

### 7.2. Compilación y verificación

```bash
npx ng build shared
cd dist/shared
```

Verificar los metadatos del paquete:

```bash
npm pkg get name version peerDependencies
```

Comprobar los archivos que se incluirán:

```bash
npm pack --dry-run
```

### 7.3. Publicación de versiones preliminares

Para publicar una versión beta:

```bash
npm publish --tag beta
```

El tag `beta` evita modificar el canal `latest` del paquete.

### 7.4. Publicación de versiones estables

Para publicar una versión estable:

```bash
npm publish
```

La publicación requiere autenticación y permisos sobre el paquete `@andes/shared` en npm.

### 7.5. Verificación

```bash
npm view @andes/shared dist-tags --json
```

Después de confirmar la publicación, crear el tag correspondiente en Git desde la raíz del repositorio:

```bash
git tag shared-v7.0.0-beta.1
git push origin shared-v7.0.0-beta.1
```

El nombre del tag debe coincidir con la versión efectivamente publicada.

## 8. Documentación

- [CHANGELOG.md](./CHANGELOG.md): historial de versiones y cambios relevantes.
- [MIGRATION.md](./MIGRATION.md): instrucciones para actualizar desde versiones anteriores.

## 9. Ayuda

Para consultar los comandos disponibles de Angular CLI:

```bash
npx ng help
```

Documentación oficial: [Angular CLI](https://angular.dev/tools/cli).