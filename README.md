## Aplicación para ANDES

CLI for Angular applications based on the [ember-cli](http://www.ember-cli.com/) project.

## Notas

Como Angular2 y Angular-CLI son proyectos que están en constante actualización, recomendamos utilizar las versiones específicas detalladas en este documento

## Prerequisitos

Este proyecto es una aplicación Angular2 basada en [angular-cli](https://cli.angular.io/)

## Instalación

**NOTA DE ACTUALIZACION:** Si ya se cuenta con una versión anterior de la aplicación, se recomienda borrar la carpeta node_modules para evitar conflictos de versiones de angular y angular-cli
```bash
cd app
rd node_modules /s
```

### Instalar angular-cli en forma global

```bash
npm install -g @angular/cli@1.0.0-beta.32.3
```

### Correr npm install en la carpeta del proyecto

```bash
cd app
npm install
```

### Iniciar la aplicación

```bash
ng serve
```