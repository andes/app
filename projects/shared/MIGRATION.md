# Migración de @andes/shared 6.x a 7.x

## Requisitos

- Angular 15.2.x.
- `@andes/plex` 9.0.0.
- TypeScript compatible con Angular 15.

## Cambios principales

### 1. Actualización a Angular 15

La librería se compila mediante `ng-packagr` 15 y Angular Ivy en modo `partial`, reemplazando la configuración de compilación anterior.

### 2. Compatibilidad con "@andes/plex": "^9.0.0-beta.8"

Se actualizaron componentes y templates para utilizar los tipos y propiedades admitidos por `@andes/plex` 9.0.0-beta.8 o una versión compatible.

Los consumidores deberán verificar su compatibilidad con la versión correspondiente de `@andes/plex`.

Para la versión definitiva de `@andes/shared` 7.0.0 se requerirá Plex 9 estable.

### 3. Manejo de errores HTTP

Se mejoró el manejo de errores del servicio `Server`:

- Interpretación de errores HTTP recibidos como `Blob`.
- Normalización de mensajes de error.
- Mejoras en el registro de errores del frontend.
- Manejo de fallos de logging sin interrumpir el observador global de errores.

### 4. Validaciones recomendadas

Después de actualizar, verificar:

- Compilación de la aplicación.
- Funcionamiento de componentes y pipes compartidos.
- Carga de archivos.
- Visualización y propagación de errores HTTP.
- Registro de errores del frontend.