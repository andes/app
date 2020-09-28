# [5.14.0](https://github.com/andes/app/compare/v5.13.0...v5.14.0) (2020-09-23)


### Bug Fixes

* **mapa-camas:** handler null ubicacion ([#1916](https://github.com/andes/app/issues/1916)) ([a86b1e8](https://github.com/andes/app/commit/a86b1e80bab53678dde70fedfa7264c7e66e00e8))
* **rup:** fix sinonimo components ([24a06b0](https://github.com/andes/app/commit/24a06b00bfa64c0314521c54e60078ec9d5cc92e))
* **rup:** odontrograma no se podia usar como segungo registro ([#1909](https://github.com/andes/app/issues/1909)) ([1be48b8](https://github.com/andes/app/commit/1be48b86e97fa764c009ddafaede107206fdd52d))
* **rup:** permitir ver y continuar prestación si el usuario no tiene acceso a huds ([#1911](https://github.com/andes/app/issues/1911)) ([4a590c4](https://github.com/andes/app/commit/4a590c4ff95de40b85ae0f5bcf3ee58bda81c335))
* **TOP:** no se visualizaban  indicaciones de RUP ([#1919](https://github.com/andes/app/issues/1919)) ([ac32a00](https://github.com/andes/app/commit/ac32a0042cc88ee9e50a731a75cd23ec52b11326))


### Features

* **GDU:** actualiza control de permisos de GDU ([#1912](https://github.com/andes/app/issues/1912)) ([6ba3b06](https://github.com/andes/app/commit/6ba3b06fd740150f1e145266c3081d8084ee5f9d))
* **huds:** change to /huds routes ([#1908](https://github.com/andes/app/issues/1908)) ([0ce0936](https://github.com/andes/app/commit/0ce093668ede5875b89241b50b26edd03261e11e))
* **mapa-camas:** agrega UO origen al extra al hacer movimiento ([#1820](https://github.com/andes/app/issues/1820)) ([b963efc](https://github.com/andes/app/commit/b963efc3da208bcb5d97b65d78a014034f1f208f))
* **mapa-camas:** renombra 'cambiar UO' a 'pase de UO' ([#1836](https://github.com/andes/app/issues/1836)) ([689045e](https://github.com/andes/app/commit/689045e9e8a2b0fb86e62ae58f28ab901aa06880))
* **rup:** buscador mostrar fsn en los sinónimos ([#1896](https://github.com/andes/app/issues/1896)) ([4dda328](https://github.com/andes/app/commit/4dda328d8a0df3dffc99afa45fcd7ce516f41272))
* **TOP:** observaciones al iniciar prestacion ([#1906](https://github.com/andes/app/issues/1906)) ([ac8343f](https://github.com/andes/app/commit/ac8343ffe9b6145868f56b6115fe99d4461dbaef))
* **TOP:** refactor visual en busqueda de paciente ([#1913](https://github.com/andes/app/issues/1913)) ([2a4db01](https://github.com/andes/app/commit/2a4db01b9486a4549cdb9d8cc831a463d19476b6))

# [5.13.0](https://github.com/andes/app/compare/v5.12.0...v5.13.0) (2020-09-16)


### Bug Fixes

* **GDU:** arregla sincro de permisos y perfiles ([#1887](https://github.com/andes/app/issues/1887)) ([fe8081d](https://github.com/andes/app/commit/fe8081d4a0db5652de9e67dcbcb243eca1eba07c))
* **mpi:** ignorar y guardar paciente ([#1831](https://github.com/andes/app/issues/1831)) ([26887b6](https://github.com/andes/app/commit/26887b68dd85accd049cd1d343a8e2d7092cdb98))


### Features

* **informacion:** se agrega modulo visualizacion-informacion ([#1893](https://github.com/andes/app/issues/1893)) ([5e1c555](https://github.com/andes/app/commit/5e1c555a7162e26078f844a17e8323b9da26069a))
* **plex:** v6.15.3 ([#1902](https://github.com/andes/app/issues/1902)) ([dce0fcb](https://github.com/andes/app/commit/dce0fcb4830457409703be4f918085a6bac2f917))

# [5.12.0](https://github.com/andes/app/compare/v5.11.0...v5.12.0) (2020-09-09)


### Bug Fixes

* **huds:** muestra nombre correcto de concepto de solicitud ([#1797](https://github.com/andes/app/issues/1797)) ([3fd03a7](https://github.com/andes/app/commit/3fd03a78adae17e2f9f6d9fa3e3eb3f2f3c5b75b))
* **mpi:** quita scroll-infinito de buscador y listado ([#1897](https://github.com/andes/app/issues/1897)) ([6a23730](https://github.com/andes/app/commit/6a23730526f73cac6c73beca0e10b60f916ec928))
* **rup:** agrega required a ValorNumerico ([#1894](https://github.com/andes/app/issues/1894)) ([a6c42b9](https://github.com/andes/app/commit/a6c42b9c25cd3a31d4139ec702000815369ad10a))
* **rup:** modifica ancho de listado de pacientes ([#1889](https://github.com/andes/app/issues/1889)) ([85efd7c](https://github.com/andes/app/commit/85efd7c5d4ed41f004e1df635cce4c9fa0159255))


### Features

* **core:** @andes/plex 6.15.0 ([#1892](https://github.com/andes/app/issues/1892)) ([14a647e](https://github.com/andes/app/commit/14a647e78a68d5136307caee457d82784f034cdb))
* **core:** tipoPrestacion.id por tipoPrestacion.conceptId ([#1873](https://github.com/andes/app/issues/1873)) ([98c9cab](https://github.com/andes/app/commit/98c9cab658cbc91a39c0251d12377794a30bd43d))
* **mapa-camas:** agregar y editar una nota en las camas ocupadas ([#1821](https://github.com/andes/app/issues/1821)) ([d2ab27d](https://github.com/andes/app/commit/d2ab27d153fd02e6a01db6396f5ff1294f1934ad))
* **mapa-camas:** filtros distintos para fechas de ingreso y egreso ([#1774](https://github.com/andes/app/issues/1774)) ([aa25a33](https://github.com/andes/app/commit/aa25a334366657a068e8caa5e09d1e20bbcc112d))
* **mapa-camas:** quita el hardcodeo de colores en el estado de servicio ([#1843](https://github.com/andes/app/issues/1843)) ([eff4cb9](https://github.com/andes/app/commit/eff4cb98827feb090ff928cf23708aadf83561bc))
* **mpi:** Agrega boton 'editar datos' de un paciente ([#1888](https://github.com/andes/app/issues/1888)) ([154bc58](https://github.com/andes/app/commit/154bc58b040d0d94f1954a63f4a33d7fede55229))
* **organizaciones:** configurar cuentas de email asociadas al efector ([#1862](https://github.com/andes/app/issues/1862)) ([db64b45](https://github.com/andes/app/commit/db64b4578a9fa2f6590d6e2f33844b054ffc0f5a))
* **rup:** pto inicio lazy load pendientes ([#1728](https://github.com/andes/app/issues/1728)) ([7872654](https://github.com/andes/app/commit/78726545dd94639546961b429c9e058d3fa9745a))

# [5.11.0](https://github.com/andes/app/compare/v5.10.0...v5.11.0) (2020-09-02)


### Bug Fixes

* **mapa-camas:** missing DragAndDrop service ([#1890](https://github.com/andes/app/issues/1890)) ([011fc4b](https://github.com/andes/app/commit/011fc4b48bd98ec2ba90afd1b915e8b6ab3bdc2d))
* **mapa-camas:** no se visualiza la huds ([#1881](https://github.com/andes/app/issues/1881)) ([0e5a85c](https://github.com/andes/app/commit/0e5a85c208dfb4c4897601bf3deb00a7cf331640))
* **rup:** filtrar valores null de los graficos ([#1846](https://github.com/andes/app/issues/1846)) ([cdf5786](https://github.com/andes/app/commit/cdf57860dc3a0fe4a7b8e41b919ec37829c64eff))
* **TOP:** remueve condicion tieneTurno de busqueda de validadas ([#1867](https://github.com/andes/app/issues/1867)) ([76174a3](https://github.com/andes/app/commit/76174a3dcf0d7dc9791c15a9e3eb76c7f35a430b))


### Features

* **elemento-rup:** filtro por sexo en requeridos ([#1828](https://github.com/andes/app/issues/1828)) ([8fe206c](https://github.com/andes/app/commit/8fe206cb524b6a6dd3dabc8a41907d519c0ea0a3))
* **elementos-rup:** elimina atomos y moléculas que no deberían existir ([#1856](https://github.com/andes/app/issues/1856)) ([63b9b29](https://github.com/andes/app/commit/63b9b2901fe5876348e9803f3870e39dc849aa1e))
* **gdu:** permitir copy/paste entre prestaciones ([#1878](https://github.com/andes/app/issues/1878)) ([3471f50](https://github.com/andes/app/commit/3471f50bd002c788830cd953c8b20d30642428d1))
* **mapa-camas:** permite ordenar por columna ([#1851](https://github.com/andes/app/issues/1851)) ([a933596](https://github.com/andes/app/commit/a933596944513845d1c941c4355ebb837b5b5616))
* **mpi:** muestra direccion legal del paciente ([#1876](https://github.com/andes/app/issues/1876)) ([be39e08](https://github.com/andes/app/commit/be39e0890468d86fb5222e6fc539d6ed1929e623))
* **organizaciones:** disable eliminar UO que esta en uso en una cama ([#1770](https://github.com/andes/app/issues/1770)) ([8857b42](https://github.com/andes/app/commit/8857b42a9151d7188624e822dc7ae1acf2016613))
* **rup:** asistencia del turno en background ([#1788](https://github.com/andes/app/issues/1788)) ([3d8f2d4](https://github.com/andes/app/commit/3d8f2d4087e6a77bf5b274d50f1ecf6abf0f1253))

# [5.10.0](https://github.com/andes/app/compare/v5.9.0...v5.10.0) (2020-08-26)


### Bug Fixes

* **obra-social:** elimina llamados el getObraSocial ([#1752](https://github.com/andes/app/issues/1752)) ([315a7b8](https://github.com/andes/app/commit/315a7b857095391c52d7ecd476ea427752c06857))
* **top:** arreglo en visualización de reglas globales ([#1865](https://github.com/andes/app/issues/1865)) ([77760d0](https://github.com/andes/app/commit/77760d017bd153131101003e6285a257c3f40732))


### Features

* **elementos-rup:** agrega label en solo valores ([#1853](https://github.com/andes/app/issues/1853)) ([47bbfd1](https://github.com/andes/app/commit/47bbfd152ac1a5cbbad0af35241a5ab09bcc9c9a))
* **huds:** add legal warning modal ([#1874](https://github.com/andes/app/issues/1874)) ([ff6434f](https://github.com/andes/app/commit/ff6434f1ddaa3f69234cf30eccbbb2ec13b068d7))
* **huds:** agrega texto legales al modal de accesos ([#1875](https://github.com/andes/app/issues/1875)) ([826691c](https://github.com/andes/app/commit/826691c40e77f01ba3b5f07bda449ae473594aac))
* **mapa-camas:** agrega modal acceso a registros medicos ([#1871](https://github.com/andes/app/issues/1871)) ([b488712](https://github.com/andes/app/commit/b488712a536f8c098bf5ee436c2e6313e3d0c738))
* **mapa-camas:** permiso para editar cama ([#1807](https://github.com/andes/app/issues/1807)) ([9306a24](https://github.com/andes/app/commit/9306a24b2337fbd0ff310d04a7affbe5c5bb31a4))
* **organizacion:** endpoints de sectores ([#1818](https://github.com/andes/app/issues/1818)) ([b5eb64b](https://github.com/andes/app/commit/b5eb64be6e8ed2440ab38544b36cd887aa846303))
* **rup:** buscador filtrar por descendientes ([#1810](https://github.com/andes/app/issues/1810)) ([3cfdea8](https://github.com/andes/app/commit/3cfdea8079012839f53f042d24a4cef9892338bb))
* **rup:** link a snomed browser en buscardor ([#1800](https://github.com/andes/app/issues/1800)) ([6264857](https://github.com/andes/app/commit/62648571437873f9efe872ccdaef6cc1a9cc73b8))
* **TOP:** devolver asignadas para auditor ([#1869](https://github.com/andes/app/issues/1869)) ([67c6a04](https://github.com/andes/app/commit/67c6a04a33de6845e5bd4ec6a9c6c58605ec5ec7))
* **TOP:** observaciones en referir solicitud ([#1860](https://github.com/andes/app/issues/1860)) ([532756a](https://github.com/andes/app/commit/532756a3e201e89323020e7ea3b04ee82dcdfc2e))

# [5.9.0](https://github.com/andes/app/compare/v5.8.0...v5.9.0) (2020-08-19)


### Bug Fixes

* **core:** remove beforeupload ([#1863](https://github.com/andes/app/issues/1863)) ([9732a5f](https://github.com/andes/app/commit/9732a5ffab563b9de939e35b218d09e9e1288ed3))
* **mpi:** alta de bebe con progenitor/a extranjero/a ([#1847](https://github.com/andes/app/issues/1847)) ([9063fb3](https://github.com/andes/app/commit/9063fb3464693d157e1e16b55fb1f1fd2fd8c060))
* **TOP:** fix asignadas sin profesional ([#1861](https://github.com/andes/app/issues/1861)) ([e36ae94](https://github.com/andes/app/commit/e36ae94de9cdb5f8bb8398ebc8934711877596b1))


### Features

* **core:** delete session data before close ([#1849](https://github.com/andes/app/issues/1849)) ([988cb06](https://github.com/andes/app/commit/988cb06d0bfde0f6f17b57357abe360b14b9a3e5))
* **mpi:** estado/fecha de fallecimiento de paciente ([#1838](https://github.com/andes/app/issues/1838)) ([44e7a11](https://github.com/andes/app/commit/44e7a11aa725f43868549aa54e4c79b6a0228b16))
* **mpi:** fix badge de activacion mobile ([#1845](https://github.com/andes/app/issues/1845)) ([5ac575a](https://github.com/andes/app/commit/5ac575afc15140e125e7322caef4f201bbe9a8dc))
* **plex:** v6.11.4 ([#1858](https://github.com/andes/app/issues/1858)) ([22e414b](https://github.com/andes/app/commit/22e414b312e35fafa09d07873f7d9864a6b6f985))

# [5.8.0](https://github.com/andes/app/compare/v5.7.0...v5.8.0) (2020-08-12)


### Bug Fixes

* **mpi:** fix pacientes similares ([#1832](https://github.com/andes/app/issues/1832)) ([ef1737f](https://github.com/andes/app/commit/ef1737f3d265476eab578a0921f2d8fad9dd0147))
* **reportes:** agrega control para cuando no esta activo el microservicio ([#1852](https://github.com/andes/app/issues/1852)) ([a1efc81](https://github.com/andes/app/commit/a1efc812b88e20d34a4a91900405868f4e9de1c9))
* **TOP:** Agrega control en la seleccion del profesional al asignar una solicitud ([#1830](https://github.com/andes/app/issues/1830)) ([e9f038d](https://github.com/andes/app/commit/e9f038db4f657e09edcbd2d31e80b580ed85ab93))
* **TOP:** control en visualización de reglas ([#1841](https://github.com/andes/app/issues/1841)) ([75b63a9](https://github.com/andes/app/commit/75b63a977b35cf4308c82660c5d40e76dc63fd02))


### Features

* **top:** nuva columna con fecha de registro ([#1834](https://github.com/andes/app/issues/1834)) ([660a800](https://github.com/andes/app/commit/660a80081f8ae3841db7d3ba914c1244738e3f20))
* **TOP:** busca por mas de una prestacion destino ([#1837](https://github.com/andes/app/issues/1837)) ([a423351](https://github.com/andes/app/commit/a42335173bbdd9cccfb23bb654b5c7f8a2538a89))

# [5.7.0](https://github.com/andes/app/compare/v5.6.0...v5.7.0) (2020-08-05)


### Bug Fixes

* **huds:** no se visualizaban las solicitudes ([#1822](https://github.com/andes/app/issues/1822)) ([080a500](https://github.com/andes/app/commit/080a500e0a8028343da8bae43d25d45002f391b6))
* **rup:** diagnostico principal en internacion ([#1825](https://github.com/andes/app/issues/1825)) ([5211b89](https://github.com/andes/app/commit/5211b898102dfbd1c4a5522b97df2943b06ab566))


### Features

* **elementos-rup:** componente ultima fecha ([#1694](https://github.com/andes/app/issues/1694)) ([9198523](https://github.com/andes/app/commit/91985236ca66de5b7b80baf8de278c3152fb446b))
* **huds:** agrega grafico de temperatura a resumen-paciente ([#1772](https://github.com/andes/app/issues/1772)) ([e1e5d13](https://github.com/andes/app/commit/e1e5d13ddf0b6e6e15859da6338388c5abdfc227))
* **rup:** expandir observaciones ([#1791](https://github.com/andes/app/issues/1791)) ([d850a3e](https://github.com/andes/app/commit/d850a3e0ae2cbe0c616b24054126785f956da1f0))

# [5.6.0](https://github.com/andes/app/compare/v5.5.0...v5.6.0) (2020-07-29)


### Bug Fixes

* **GDU:** quita event emit de onChange ([#1789](https://github.com/andes/app/issues/1789)) ([0001fd6](https://github.com/andes/app/commit/0001fd676fb1c8d3c3d8d190ee523ae31fedefc4))
* **huds:** badge total de prestaciones ([#1769](https://github.com/andes/app/issues/1769)) ([d0769b9](https://github.com/andes/app/commit/d0769b9bb0250d9d8fdf3dcd81ad7638d1adeae6))
* **huds:** cerrar modal acceso con escape ([#1579](https://github.com/andes/app/issues/1579)) ([e46f731](https://github.com/andes/app/commit/e46f731bb295b0a571fe7acd579a71a8e9d5de91))
* **reportes:** elimina async await erroneos ([c1d6f5f](https://github.com/andes/app/commit/c1d6f5fa8436310940cf1baad5c1a5e2ce1af696))
* **rup:** ajustes visuales ([#1730](https://github.com/andes/app/issues/1730)) ([ceb4453](https://github.com/andes/app/commit/ceb4453576c7d66742121f68508be09568d79bb3))
* **rup:** sincronizacion de datos en buscador ([#1522](https://github.com/andes/app/issues/1522)) ([60fc180](https://github.com/andes/app/commit/60fc180e3999d834287cd5cdfa57d87f93c00afc)), closes [#1521](https://github.com/andes/app/issues/1521)
* **rup:** ver resumen fuera de agenda no nominalizada ([#1792](https://github.com/andes/app/issues/1792)) ([9c198d0](https://github.com/andes/app/commit/9c198d0962c5b1905e3470ad46a07d78f958049e))
* **TOP:** Arregla duplicacion de prestacion al iniciar solicitud asignada ([#1809](https://github.com/andes/app/issues/1809)) ([1fa618f](https://github.com/andes/app/commit/1fa618f3d2a81027c7bba163a6b8fff6f0460ca1))
* **turnos:** muestra correctamente prepagas ([#1805](https://github.com/andes/app/issues/1805)) ([eb0e3c1](https://github.com/andes/app/commit/eb0e3c168df3d1659de773d981824b3b49757327))


### Features

* **citas:** audita agenda al validar prestacion no nominalizada ([#1783](https://github.com/andes/app/issues/1783)) ([def3680](https://github.com/andes/app/commit/def36809f799d0a534cdbe605fbf0cdf13a54bc1))
* **huds:** agrega eventos de google analytics ([#1749](https://github.com/andes/app/issues/1749)) ([ddd1908](https://github.com/andes/app/commit/ddd1908a297c9622debd8035c27b94e7e828047f))
* **huds:** filtrado de registro por texto ([#1799](https://github.com/andes/app/issues/1799)) ([fb3ef6a](https://github.com/andes/app/commit/fb3ef6a1227ae3265619c4fe775a44d97bb90479))
* **huds:** muestra tipo de prestacion en registros ([#1793](https://github.com/andes/app/issues/1793)) ([90e4c00](https://github.com/andes/app/commit/90e4c00599e0f0376afcc29a954dc64971e01655))
* **mapa-camas:** agrega teléfono y dirección en detalle de paciente ([#1806](https://github.com/andes/app/issues/1806)) ([ec5cb7a](https://github.com/andes/app/commit/ec5cb7ad75b85c0385d4706524ea67d68924faf0))
* **mapa-camas:** quita filtro por ambito en registros medicos ([#1816](https://github.com/andes/app/issues/1816)) ([708f5e2](https://github.com/andes/app/commit/708f5e2ca0d4633bec2a35f1bfc2efcb225472b6))
* **mapa-camas:** registros filtros por unidad organizativa ([#1814](https://github.com/andes/app/issues/1814)) ([71ffac1](https://github.com/andes/app/commit/71ffac10ffdaf18e4a8036bd0d6d48a30be63ec7))
* **reportes:** se agrega reportes de covid ([f98525d](https://github.com/andes/app/commit/f98525d4f715cb6ba307792204f689c8d46dd67b))
* **rup:** árbol relaciones en ejecución ([#1620](https://github.com/andes/app/issues/1620)) ([9e10b91](https://github.com/andes/app/commit/9e10b91b73c7a7061c7975a9a51ac050bede9b88))
* **TOP:** help de reglas en ejecucion de prestacion ([#1787](https://github.com/andes/app/issues/1787)) ([4c9fd63](https://github.com/andes/app/commit/4c9fd6302ddbefbe80c40efc70741b6f98af27d8))
* **TOP:** organizaciones destino en bandeja de salida ([#1795](https://github.com/andes/app/issues/1795)) ([6beae6d](https://github.com/andes/app/commit/6beae6dcf5b6085ee0d8918ff0f772890112c9ca))

# [5.5.0](https://github.com/andes/app/compare/v5.4.0...v5.5.0) (2020-07-22)


### Bug Fixes

* **mapa-camas:** botón validad prestación disabled ([#1767](https://github.com/andes/app/issues/1767)) ([f5a773d](https://github.com/andes/app/commit/f5a773d2c128271a85882f16d8d0bd02fa304411))
* **rup:** arreglo de acceso a huds sin elegir motivo ([83e39cc](https://github.com/andes/app/commit/83e39ccd0751e8015b8b8a3b47734ff6b4dee7a4))
* **rup:** error en lifecycle de angular ([#1796](https://github.com/andes/app/issues/1796)) ([991a2fa](https://github.com/andes/app/commit/991a2fa73e587ea54a755324d85a69bdd5bcdc30))
* **RUP:** arregla duplicacion solicitudes auditables ([#1729](https://github.com/andes/app/issues/1729)) ([289b5aa](https://github.com/andes/app/commit/289b5aa93f664ac239437ff960d22d66fd829f94))


### Features

* **ambulatorio:** visualizar agendas sin turnos  ([#1717](https://github.com/andes/app/issues/1717)) ([7888045](https://github.com/andes/app/commit/7888045f36a8ffacd6dccd65f620b8e07e67a315))
* **mapa-camas:** dias de estada x servicios ([#1780](https://github.com/andes/app/issues/1780)) ([b9bdfe0](https://github.com/andes/app/commit/b9bdfe018b43203df750811b515587e68ff40707))
* **mapa-camas:** persistencia de filtros segun usuario ([#1771](https://github.com/andes/app/issues/1771)) ([2367ec5](https://github.com/andes/app/commit/2367ec5a55ac33e130721eee75897d68e4c6a194))
* **rup:** configurar diagnostico principal dinamico ([#1722](https://github.com/andes/app/issues/1722)) ([38e2fa4](https://github.com/andes/app/commit/38e2fa4540f055722d6c4f0531c16bbbf9818121))
* **RUP:** Implementa plex-help ([b508a8e](https://github.com/andes/app/commit/b508a8e2bf4540fd024ee9b8d7a5dd899d5c2548))

# [5.4.0](https://github.com/andes/app/compare/v5.3.0...v5.4.0) (2020-07-15)


### Bug Fixes

* **TM:** Organizaciones arregla seleccion de items de ubicacion vacios ([fc9b440](https://github.com/andes/app/commit/fc9b440c768a486ddb6a1f527a1d1c0af45a9eb2))
* **TM:** refresca lista de organizaciones al retornar de creacion ([491c2db](https://github.com/andes/app/commit/491c2dbcf9921e9230ad8fa999e30ea2e2ae9871))
* **TOP:** oculta filtro org origen de bandeja salida ([3fd1cc1](https://github.com/andes/app/commit/3fd1cc190d6e04ffda988314afa408d25739ea0a))


### Features

* **gestor-usuarios:** ocultar botón de 'Perfiles' si no tiene permiso ([e44dfc4](https://github.com/andes/app/commit/e44dfc4cabf99ddfc51c4baf146d861b092fba3e))
* **menu:** armado de menú hamburguesa a partir de los módulos ([2ebe4c2](https://github.com/andes/app/commit/2ebe4c245a5a60bf4e9413fbaf8d4d4726eb1795))
* **TM:** agrega provincia a edicion de organizacion ([3867e03](https://github.com/andes/app/commit/3867e03be42020759741f10b2faa34c089a1e221))
* **TOP:** filtro multiple organizaciones origen ([1fc357f](https://github.com/andes/app/commit/1fc357f64a81762daafc2d5e1afc0d380bea586f))
* **TOP:** profesional sin permisos acceso mis asginadas x defecto ([6f12051](https://github.com/andes/app/commit/6f12051a5e826433837ddcf56b68442b3f6e4e91))

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
