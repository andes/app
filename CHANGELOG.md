# [5.3.0](https://github.com/andes/app/compare/v5.2.0...v5.3.0) (2020-07-08)


### Bug Fixes

* **citas:** quitar botón de dar turno desde solicitudes punto de inicio ([5e2bf35](https://github.com/andes/app/commit/5e2bf35832cc717252436a54d7ac6996c41ed7fe))
* se agrega package-lock ([1cc24d4](https://github.com/andes/app/commit/1cc24d4401ca6cab721f30294edfc4fda3085fb6))
* **huds:** fecha ultima evolución ([#1758](https://github.com/andes/app/issues/1758)) ([410d75b](https://github.com/andes/app/commit/410d75bc77781159d685cfe01680dce987ae26e8))
* **rup:** plantillas de solicitudes en secciónes ([#1756](https://github.com/andes/app/issues/1756)) ([0fc68fd](https://github.com/andes/app/commit/0fc68fd91dcdbc76251bea3bda9a3d8712c65517))
* **select-organizacion:** para conexion lenta ([7725417](https://github.com/andes/app/commit/7725417f161d5dee1208ba74e42731e50ada3455))


### Features

* **gdu:** mensaje para usuario sin permisos en organizaciones ([9640fa2](https://github.com/andes/app/commit/9640fa28295eb1243e10c9c04ad4418600a4228b))
* **mapa-camas:** registros medicos en capa estadistica ([#1718](https://github.com/andes/app/issues/1718)) ([df65036](https://github.com/andes/app/commit/df65036b0f6d7144d42d3cb19bae39472f8ab8ff))
* **novedades:** mostrar novedades sin módulo asignado ([75da37c](https://github.com/andes/app/commit/75da37cb6eff977fe06870e641d161d19c5e9cd8))
* **PlanillaC1:** Filtrar por profesional ([f6a6fd4](https://github.com/andes/app/commit/f6a6fd4b0617b0117647767f4eab04ddff676b04))


### Performance Improvements

* **rup:** remueve request duplicados ([#1742](https://github.com/andes/app/issues/1742)) ([97f1665](https://github.com/andes/app/commit/97f1665775d79d56ae86968ed9b1009f08e8534e))

# [5.2.0](https://github.com/andes/app/compare/v5.1.0...v5.2.0) (2020-07-01)


### Bug Fixes

* **mpi:** asigna scan al paciente ([c2e413f](https://github.com/andes/app/commit/c2e413faac2abb5ad02e6d2d139fd2b2a96685cb))
* **mpi:** validacion email y celular activacion appMobile ([793b8ae](https://github.com/andes/app/commit/793b8ae47b7f46dffa197c084d90ca68c514b830))
* **RUP:** control de seleccion de ternas de reglas ([fdbeaeb](https://github.com/andes/app/commit/fdbeaeb33e1f409a1fad72ebcc9da458197bd9d1))
* **TOP:** Corrige filtros segun reglas de solicitudes ([f07b9a2](https://github.com/andes/app/commit/f07b9a2b5a431be5e658bc2d665c4038cd9e745a))


### Features

* **auth:** nuevo componente modal para mostrar el disclaimer al seleccionar la organización ([547c1d2](https://github.com/andes/app/commit/547c1d282d889cf43586f93b69f951354b6a3101))
* nueva versión de plex ([b290117](https://github.com/andes/app/commit/b290117cc718dfcfd936999d362776d3544055cd))
* **gdu:** visualizacion de organizaciones sin permisos ([15f3623](https://github.com/andes/app/commit/15f3623571ee047ffc24eb1cb3a2e49cc6832287))
* **mpi:** agrega carga de un paciente ([d9a0493](https://github.com/andes/app/commit/d9a04938aa10c221b5b609a628ba1fd02310e41e))
* **rup:** guardar prestación si es una solicitud autocitada y no tiene organización destino ([08af83b](https://github.com/andes/app/commit/08af83ba1c7ac2ac17e3746fe4b32afd5a6285c8))
* **TOP:** cambia a operacion citar en PATCH de solicitud ([19af200](https://github.com/andes/app/commit/19af200ba721f6be90753c6bdb1455edc6e89a0e))
* **TOP:** limpia prestacion destino al cambiar de organizacion ([ff4665a](https://github.com/andes/app/commit/ff4665ab023f4516d17ebec20f3c29a45fc6c79a))

# [5.1.0](https://github.com/andes/app/compare/v5.0.0...v5.1.0) (2020-06-24)


### Bug Fixes

* **huds:** navegacion entre modulos ([#1727](https://github.com/andes/app/issues/1727)) ([1a26322](https://github.com/andes/app/commit/1a26322eddb54a0bdf231140dc884f4c627306a5))
* **rup:** corrige superposición de filtros ([#1750](https://github.com/andes/app/issues/1750)) ([ca6e6b4](https://github.com/andes/app/commit/ca6e6b4c0448a372f580d13ca81f7d5ed0946983))
* **tm:** Validacion profesionales renaper ([de6c9b2](https://github.com/andes/app/commit/de6c9b2a3902fa7812bc117deab5115f23696eb7))
* **TOP:** arregla duplicidad de estados de nueva solicitud ([bde5e2b](https://github.com/andes/app/commit/bde5e2bf4f1390dfdbe44222154e68fd5fedbd06))
* **usuarios:** seleccion todas las prestaciones ([2965560](https://github.com/andes/app/commit/296556089a2a796e38d3bfcfe6423e2c99f3cd1a))


### Features

* **huds:** descargar informe rup desde huds ([#1743](https://github.com/andes/app/issues/1743)) ([a7f6e8c](https://github.com/andes/app/commit/a7f6e8cd81070cb7b66e40721f0941146e685691))
* **mapa-camas:** agrega filtro de prestacion en registros medicos ([#1744](https://github.com/andes/app/issues/1744)) ([142028c](https://github.com/andes/app/commit/142028cd5bd6050bd3a1b375bcc7f16984606d2c))
* **novedades:** ocultar campana si no hay novedades, filtro por módulos activos y ordenamiento ([ac54e96](https://github.com/andes/app/commit/ac54e9619b70385d3954a103e47d30b3b3a9954f))
* **rup:** historial HUDS en ejecución de prestación ([#1577](https://github.com/andes/app/issues/1577)) ([038be06](https://github.com/andes/app/commit/038be0659ced7f6f81e90d3257fba4f03aae44a3))
* **TOP:** indicaciones solicitud en plex-help ([b07a0c9](https://github.com/andes/app/commit/b07a0c9ae4f0b3a6b6ec2fbc7a80838312678bf4))
