![ANDES](https://github.com/andes/andes.github.io/raw/master/images/logo.png)

## App

Aplicación Angular2 para ANDES

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
npm install -g @angular/cli@1.4.0
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


## Docker

### Build images

```bash
docker build -t andesnqn/app .
```

### Run image in container

```bash
docker run  -p  4200:4200  --rm --name andes_app andesnqn/app
```

### Run container for development

```bash
docker run -v  ${pwd}:/usr/src/app  -p  4200:4200   --rm --name andes_app andesnqn/app 

#Stop container
docker stop andes_app

#Run command in container
docker exec andes_app npm install

```

