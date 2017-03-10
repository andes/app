## Aplicación para ANDES

Aplicación web Angular2 para ANDES

## Notas

Como Angular2 y Angular-CLI son proyectos que están en constante actualización, recomendamos utilizar las versiones específicas detalladas en este documento

## Instalación

**NOTA DE ACTUALIZACION:** Si ya se cuenta con una versión anterior de la aplicación, se recomienda borrar la carpeta node_modules para evitar conflictos de versiones de angular y angular-cli

```bash
# Windows
cd app
rd node_modules /s

# Linux
cd app
rm -r node_modules
```

### Instalar angular-cli en forma global

```bash
npm install -g @angular/cli@1.0.0-beta.32.3
```

### Instalar dependencias

```bash
cd app
npm install
```

### Iniciar la aplicación

```bash
ng serve
```