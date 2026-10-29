# Changelog

Todos los cambios relevantes de `@andes/shared` se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y el proyecto utiliza [Versionado Semántico](https://semver.org/lang/es/).

## [7.0.0-beta.1] - 2026-10-29

### Cambios

- Migración de la librería a Angular 15.
- Actualización del sistema de compilación a `ng-packagr` 15, utilizando Ivy en modo `partial`.
- Actualización de `peerDependencies` para Angular 15 y `@andes/plex` 9 beta.
- Actualización de las exportaciones públicas de componentes y pipes.
- Adaptación de componentes y templates a las propiedades y tipos de Plex 9.

### Correcciones

- Corrección del manejo de errores HTTP recibidos como `Blob`, evitando mostrar `[object Blob]` o contenido HTML sin procesar.
- Mejora de la normalización y propagación de mensajes de error del servicio `Server`.
- Corrección del registro de errores del frontend mediante `ServerErrorHandler`.
- Prevención de ventanas de error adicionales cuando falla el registro de errores.
- Corrección del uso de operadores y firmas deprecadas de RxJS.

### Cambios incompatibles

- La librería requiere Angular 15.
- La librería utiliza `@andes/plex` 9 beta, en reemplazo de las versiones anteriores.
- Actualización del formato de compilación y distribución del paquete Angular.

### Documentación

- Incorporación de `MIGRATION.md` con las indicaciones para actualizar desde versiones anteriores.