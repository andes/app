# [5.51.0](https://github.com/andes/app/compare/v5.50.0...v5.51.0) (2021-06-16)


### Bug Fixes

* **com:** Se agrega la posibilidad de modificar el dispositivo de oxigeno en el detalle ([4237914](https://github.com/andes/app/commit/423791448a6cb2c8ef1ff3f31a971d74061354ba))
* **COM:** Fix error en merge para instituciones de com ([cd69e29](https://github.com/andes/app/commit/cd69e2901a41498b56b80fc9130ce1ab69a2e993))
* **ficha-epidemiologica:** organizaciones y nuevo req ([565914a](https://github.com/andes/app/commit/565914a0382649d57d5cb13cf4111ccf79eb8aca))
* **mapa-camas:** limpia header en resumen de paciente ([#2326](https://github.com/andes/app/issues/2326)) ([9b62b40](https://github.com/andes/app/commit/9b62b40106400af6911ca876d251881eee7eb283))
* **permisos:** submódulo si hay al menos 1 permiso ([86a680e](https://github.com/andes/app/commit/86a680e4a9dd9eb35f817685a83cda2939804d6f))


### Features

* **com:** Se agrega la posibilidad de asignar dispositivo de oxigeno al proceso de derivación ([a0a24c0](https://github.com/andes/app/commit/a0a24c03974444bf241621b7561604a9a72b8e68))
* **inicio:** item "Punto inicio" para submódulos ([939e003](https://github.com/andes/app/commit/939e00373b615837d28ede160406e8903d831d01))
* **mapa-camas:** edicion de unidad organizativa de una cama ([#2327](https://github.com/andes/app/issues/2327)) ([69d5fea](https://github.com/andes/app/commit/69d5fea4b8fd2a8d1b485fb05c9bd8ad7650a25a))
* **mapa-camas:** visualizar registros en listado de internacion ([#2319](https://github.com/andes/app/issues/2319)) ([8a56c6c](https://github.com/andes/app/commit/8a56c6c3b6fa02f51eced561bc572d38e1b1b01c))

# [5.50.0](https://github.com/andes/app/compare/v5.49.0...v5.50.0) (2021-06-09)


### Bug Fixes

* **inscripcion:** agrega grupo sin FR ([#2311](https://github.com/andes/app/issues/2311)) ([a431896](https://github.com/andes/app/commit/a43189676a146cf813499c6eb232297e7afc368a))
* **mapa-camas:** corrige dias de estada totales en censo mensual ([#2315](https://github.com/andes/app/issues/2315)) ([338b60e](https://github.com/andes/app/commit/338b60e556991a8b10f1380bb19a1f5f3e9920fc))


### Features

* **com:** se cambia lo de switchmap y lo de los params ([05f79b7](https://github.com/andes/app/commit/05f79b78c403aa099fbfb8e5253ec8f781b86a7f))
* **COM:** asignar origen desde org COM ([89cc173](https://github.com/andes/app/commit/89cc1732c5547d3c70323b29b636120da1b000c6))
* **ficha:** field localidades ([f405f22](https://github.com/andes/app/commit/f405f2216ab49895491d7f0fc31e4eacfe8d03d8))
* **ficha-epidemiogica:** check dias ([fe23442](https://github.com/andes/app/commit/fe23442bf4ff65e15846d9adaaa088810f3c9cf0))
* **inscripcion:** agrega control de edad por reglas ([#2309](https://github.com/andes/app/issues/2309)) ([862afba](https://github.com/andes/app/commit/862afbaed53a36f5839a910dc056f33fb058fd74))
* **login:** se implementa v0.1 ([#2238](https://github.com/andes/app/issues/2238)) ([a01a4d7](https://github.com/andes/app/commit/a01a4d7e078dcabf27976cd82bcc64d58d22ba75))
* **mapa-camas:**  seleccion de otra organizacion en traslado ([#2310](https://github.com/andes/app/issues/2310)) ([8b0d11e](https://github.com/andes/app/commit/8b0d11e1d7066fba1834f71f407c6aa0debc6458))
* **mapa-camas:** guarda unidad organizativa en prestacion ([#2283](https://github.com/andes/app/issues/2283)) ([ea930c6](https://github.com/andes/app/commit/ea930c6184afbf3839c636443a3e78922084ba92))
* **mapa-camas:** plex-table en listado de internacion ([#2317](https://github.com/andes/app/issues/2317)) ([43eaa8a](https://github.com/andes/app/commit/43eaa8a86c723daca8b1c62e0aafcf77d8715ed7))
* **mapa-camas:** sincronizar plex-datetime en resumen internacion ([#2307](https://github.com/andes/app/issues/2307)) ([520cbc6](https://github.com/andes/app/commit/520cbc67676aff82aa67bbbcedee6af836b6a97b))
* **mapa-camsa:** agrega fecha de ingreso en censo diario ([#2308](https://github.com/andes/app/issues/2308)) ([79fdbe3](https://github.com/andes/app/commit/79fdbe3ec01c8f60e92d7b9a53e9b64238e09135))
* **vac:** desvincular paciente de inscripción ([#2277](https://github.com/andes/app/issues/2277)) ([2d4d587](https://github.com/andes/app/commit/2d4d587eb627f5fd8bd16c7e52c26d8c934a1b86))

# [5.49.0](https://github.com/andes/app/compare/v5.48.0...v5.49.0) (2021-06-02)


### Bug Fixes

* **buscador-ficha:** doble request ([46df6a4](https://github.com/andes/app/commit/46df6a4a3a460d9c36320d3b3ea0c1a8c0151520))
* **COM:** bug buscar org origen ([56ae829](https://github.com/andes/app/commit/56ae829eb30478aff0bf1c55ccb80223787ae883))
* **ficha:** clasificacion y loader buscar paciente ([5aab87c](https://github.com/andes/app/commit/5aab87c463361ad9fc04a4b7b61d4c622a2b8feb))
* **mapa-camas:** edición de egreso en internación validada ([#2269](https://github.com/andes/app/issues/2269)) ([9c031c8](https://github.com/andes/app/commit/9c031c8bd390cecaa9bedab606bfe0e6f73f4ddb))
* **mpi:** quita regex del nombre ([#2298](https://github.com/andes/app/issues/2298)) ([2fb85b1](https://github.com/andes/app/commit/2fb85b1ae14412685b9eac2e5073667183442e88))
* **rup:** cambia solicitante por profesional ([#2294](https://github.com/andes/app/issues/2294)) ([88da8e6](https://github.com/andes/app/commit/88da8e6dfbb6a314963a327adb7821ac2c2af505))
* **top:** deshabilita boton hasta no cargar datos requeridos en formulario ([#2288](https://github.com/andes/app/issues/2288)) ([410056d](https://github.com/andes/app/commit/410056d3061c471c00d74c8678066af2e17de334))


### Features

* **ficha-epidemiologica:** mensaje no hay fichas ([b247443](https://github.com/andes/app/commit/b247443baa4d9c8dcc0235e2addaef289b27137d))
* **fichaEpidemiologia:** Se agrega al pacientes la información de identificación si es extranjero ([48e0dc9](https://github.com/andes/app/commit/48e0dc95eb0667e871774a35e2cb78fb462f27ad))
* **mapa-camas:** columna obra social en listado internación ([#2290](https://github.com/andes/app/issues/2290)) ([f1df855](https://github.com/andes/app/commit/f1df8555c9ae8b862581555cf9bb501808a79ba9))
* **mapa-camas:** muestra la prestacion de estadistica en resumen de internacion ([#2299](https://github.com/andes/app/issues/2299)) ([f0029ae](https://github.com/andes/app/commit/f0029ae60598b039df0ae671a09e42b8c88d2ad6))
* **mapa-camas:** obra social prepaga ([#2285](https://github.com/andes/app/issues/2285)) ([0b7fd1b](https://github.com/andes/app/commit/0b7fd1b2a91273c3251ebe3e56ee48fa6f1c965d))
* **mpi:**  se agrega idPacientePrincipal en  paciente ([#2295](https://github.com/andes/app/issues/2295)) ([5c3b228](https://github.com/andes/app/commit/5c3b228a5aa4ceb5bb25d41938648226adc47e06))
* **rup:** agregar unidad organizativa a la prestación ([#2300](https://github.com/andes/app/issues/2300)) ([398884e](https://github.com/andes/app/commit/398884e8b0c6ecadda265082722d0505ce89a738))

# [5.48.0](https://github.com/andes/app/compare/v5.47.0...v5.48.0) (2021-05-26)


### Bug Fixes

* **Inscripciones:** mostrar errores al editar inscripcion ([#2287](https://github.com/andes/app/issues/2287)) ([d4f39a8](https://github.com/andes/app/commit/d4f39a886f8cb8a1e9ead8d5d14537fcc7bf5749))


### Features

* **bi-queries:** select-static ([6935178](https://github.com/andes/app/commit/6935178d65067b4680bd2cd5159799d5b0e5c44a))
* **citas:** nombre de los servicios en espacios fisicos ([#2280](https://github.com/andes/app/issues/2280)) ([3435d88](https://github.com/andes/app/commit/3435d880504c0cfc56dc24402fbfaecad8ce7c5a))
* **COM:** incrementar limit de busqueda ([5e0dddd](https://github.com/andes/app/commit/5e0dddd35fbcc55c741fdd79cc610f7a1a15b430))
* **ficha-epidemio:** updates ([2b002c3](https://github.com/andes/app/commit/2b002c34e38a05653e396b22b805948305874396))
* **rup:** orden alfabetico en documentos adjuntos ([#2282](https://github.com/andes/app/issues/2282)) ([e8f1495](https://github.com/andes/app/commit/e8f149598bb7fdaad9f39934d907b39af2157078))
* **tm:** agrega zonas sanitarias dentro de organizacion ([#2278](https://github.com/andes/app/issues/2278)) ([f8ffef2](https://github.com/andes/app/commit/f8ffef2db836a00c5f452ae68a3b99ac8d1ed658))
* **vac:** en la columna certificado deberá decir "No corresponde" si esta en factores-riesgo pero tiene entre 57 a 59 ([#2267](https://github.com/andes/app/issues/2267)) ([879ed87](https://github.com/andes/app/commit/879ed87892044cb779cacc9bb703bbcf313d1223))

# [5.47.0](https://github.com/andes/app/compare/v5.46.0...v5.47.0) (2021-05-19)


### Bug Fixes

* **mapa-camas:** ver registros en listado de internacion ([#2268](https://github.com/andes/app/issues/2268)) ([0cd9467](https://github.com/andes/app/commit/0cd9467d700839701d944fdd9be66fa4186fd8b2))


### Features

* **auth:** oculta navbar en select organizacion ([#2271](https://github.com/andes/app/issues/2271)) ([5794649](https://github.com/andes/app/commit/57946494c66628440f06c8fc4753c7b445046e96))
* **mapa-camas:** carga datos de internacion anterior en nuevo ingreso ([#2272](https://github.com/andes/app/issues/2272)) ([3a49184](https://github.com/andes/app/commit/3a49184bb98fd17d1bb67d63ff0be0d358e69df4))
* **mapa-camas:** filtros e interaccion en resumen internación ([#2273](https://github.com/andes/app/issues/2273)) ([1fdcc9a](https://github.com/andes/app/commit/1fdcc9a084b2499ae66f4772b9765c1b4a3ba3ac))
* **mapa-camas:** resumen internacion ([#2263](https://github.com/andes/app/issues/2263)) ([3609ac4](https://github.com/andes/app/commit/3609ac497fe9b7ca1d788b74948c6c3d30197f35))
* **mapa-camsa:** visualizacion tipo timeline ([#2274](https://github.com/andes/app/issues/2274)) ([5907cef](https://github.com/andes/app/commit/5907cef05acc12067a99f5af91cb76b14be0cd1e))
* **pdp:** visualizar mis certificados ([#2226](https://github.com/andes/app/issues/2226)) ([3b073bd](https://github.com/andes/app/commit/3b073bd52173b638dd3342e17de63944e68311f5))
* **plex:** actualiza a v7.18.0 ([#2276](https://github.com/andes/app/issues/2276)) ([6ada068](https://github.com/andes/app/commit/6ada0689ab52f0dfa722b3c374bdfb0096286dd3))
* **rup:** rules to formulaBase([#2210](https://github.com/andes/app/issues/2210)) ([ea49192](https://github.com/andes/app/commit/ea491921d2076a5fb67197964bf2bec29ba6f1d1))
* **vac:** monitoreo de inscriptos para gestión de turnos ([#2252](https://github.com/andes/app/issues/2252)) ([27feeb2](https://github.com/andes/app/commit/27feeb28d8b71172047b4e8b8c39b1176be8537a))

# [5.46.0](https://github.com/andes/app/compare/v5.45.0...v5.46.0) (2021-05-12)


### Bug Fixes

* **buscador-epidemio:** subscribe anidados y vista ([0cb9694](https://github.com/andes/app/commit/0cb969478de13d395b6c5d161867b389d1450be0))


### Features

* **buscador-epidemio:** historial de fichas ([151788d](https://github.com/andes/app/commit/151788d85d366d736bb300f62be997bc6222ada4))
* **COM:** descargar historial derivacion ([79ea366](https://github.com/andes/app/commit/79ea3661983c6ce326ffbf8840ac13ac6826fefe))
* **EP:** muestra y edita codigo SISA en buscador ([b13e8a4](https://github.com/andes/app/commit/b13e8a499ba7e71c85b837f95639d9e5324e6dd4))
* **ficha-epidemio:** actualizaciones ([6685836](https://github.com/andes/app/commit/6685836270028c60435958ed3083df4472671bd2))
* **ficha-epidemio:** vacunas ([c0e549a](https://github.com/andes/app/commit/c0e549a7a17a0ad94870e9db329b551c8bfdd735))
* **ficha.epidemiologica:** setea datos de usuario al editar una ficha ([7f33d9c](https://github.com/andes/app/commit/7f33d9c1bc882f9f6112a1ac410ce12ef66de9a9))

# [5.45.0](https://github.com/andes/app/compare/v5.44.0...v5.45.0) (2021-05-05)


### Bug Fixes

* **EP:** fix provincia id en ficha ([b050657](https://github.com/andes/app/commit/b0506579ab163f09aa0120274eb43b56794d2bb4))
* **mapa-camas:** ajuste control fecha maximo de egreso ([#2247](https://github.com/andes/app/issues/2247)) ([f96b594](https://github.com/andes/app/commit/f96b594e73db33f222b81ab061fb9072a1150f66))
* **mpi:** muestra detalle de provincia ([#2254](https://github.com/andes/app/issues/2254)) ([13c1f95](https://github.com/andes/app/commit/13c1f954b1511e84a0e9443a64833fb4f3555ec1))
* **rup:** limpieza de campos al cambiar vacuna/categoría ([#2241](https://github.com/andes/app/issues/2241)) ([ef00a3d](https://github.com/andes/app/commit/ef00a3dfe74ac8f39df1624aa8fa4ba8de7b9f32))


### Features

* **com:** unidad destino derivacion ([0610a85](https://github.com/andes/app/commit/0610a85266618bb733e4aca1b7e1c1e367b89a54))
* **plex:** v7.16.0 ([#2248](https://github.com/andes/app/issues/2248)) ([7cf802e](https://github.com/andes/app/commit/7cf802eb4290f99e674b8bdd9f884a831ed080bb))
* **rup:**  links a informacion en plantillas ([#2217](https://github.com/andes/app/issues/2217)) ([8383bf1](https://github.com/andes/app/commit/8383bf18923c2d4ac067040d0c2de6611895a1c3))
* **shared:** restringe extensiones en archivos adjuntos ([#2237](https://github.com/andes/app/issues/2237)) ([e9d3d9c](https://github.com/andes/app/commit/e9d3d9c9e82486b586c0beb356fd5e85baa66425))
* **vac:** no permitir editar inscripciones de pacientes ya vacunados ([#2253](https://github.com/andes/app/issues/2253)) ([3d7b7e8](https://github.com/andes/app/commit/3d7b7e8a4882e59b023fa5ca5c19606486f8ef24))
* **vac:** permitir cambiar el grupo de inscripciones ([#2249](https://github.com/andes/app/issues/2249)) ([20e06b7](https://github.com/andes/app/commit/20e06b70a49817a9351750828e5c64a774f69d69))
* **vac:** poder elegir notas predefinidas o escribir una ([#2250](https://github.com/andes/app/issues/2250)) ([cdf9e36](https://github.com/andes/app/commit/cdf9e36562ab3eee3ca3e7412c1ad10b81635dbe))

# [5.44.0](https://github.com/andes/app/compare/v5.43.0...v5.44.0) (2021-04-28)


### Bug Fixes

* **ficha-epidemio:** control codigo snomed ([9ff205c](https://github.com/andes/app/commit/9ff205cfa2dd4bb38156800c012962a06cc4bf25))
* **ficha-epidemio:** fechaMuestra ([69ce71e](https://github.com/andes/app/commit/69ce71e006b543dfd19cd3afe48384eb0601aa18))
* **ficha-epidemio:** no readonly PCR ([ce145fa](https://github.com/andes/app/commit/ce145fa1bdb4664081da855360649ac488f66c61))
* **mapa-camas:** varios fix internacion ([#2236](https://github.com/andes/app/issues/2236)) ([0b30611](https://github.com/andes/app/commit/0b30611e352f00142fed3c2d3b8b67b32e6d8c48))
* **pdp:** ordenar turnos de mas reciente a los mas viejos ultimos ([#2234](https://github.com/andes/app/issues/2234)) ([2df0a6c](https://github.com/andes/app/commit/2df0a6cf3b805c4f8d411a50e687ad117dadde33))


### Features

* **accesibilidad:** idioma global español ([#2214](https://github.com/andes/app/issues/2214)) ([c52b377](https://github.com/andes/app/commit/c52b377253aa507c5043ab3009789d4df36cbb21))
* **buscador-ficha:** scroll y sort ([9e37f33](https://github.com/andes/app/commit/9e37f33e0c5a0bc067909280876952d0596f1946))
* **EP:** labels en form builder ([2cdc01f](https://github.com/andes/app/commit/2cdc01f17e4ac610aec8839f4d6680eeed671945))
* **epidemio:** Se agregan select para actualización automática de resultados pcr ([b512daa](https://github.com/andes/app/commit/b512daa554e687be40102ac8398d1af9fdb4e8fe))
* **ficha-epidemio:** nuevos requerimientos ([97a9990](https://github.com/andes/app/commit/97a999028cdc267f05e4952efbb3f1900597ea83))
* **ficha-epidemio:** nuevos requermientos mpi ([ee5a055](https://github.com/andes/app/commit/ee5a05596ef30fd4815b06629c10cb7c27a171fa))
* **ficha-epidemio:** semana epidemiologica e instituciones ([04b114a](https://github.com/andes/app/commit/04b114a74066ef1e51583e3eab20c9079cf19fed))
* **ficha-epidemiologica:** set mpi y snomed ([214f74b](https://github.com/andes/app/commit/214f74b0fcc597b89d3682a450c269610c890e48))
* **fichaEpidemiologia:** pequeños cambios en la clasificación y el seteo de lo que se envía desde el laboratorio ([bda575f](https://github.com/andes/app/commit/bda575f34e545c91b1ae032db30e840e19c28a73))
* **inscripcion:** permite modificar localidad ([#2231](https://github.com/andes/app/issues/2231)) ([b71d51e](https://github.com/andes/app/commit/b71d51eab97b340dacee72b1563b41ca0cb72ada))
* **pdp:** cache de la consulta de turnos, laboratorios y vacunas ([#2233](https://github.com/andes/app/issues/2233)) ([cc0a91f](https://github.com/andes/app/commit/cc0a91f3bad47248b18f7408e366b07103bd3cfc))
* **vac:** filtro pro nombre y apellido ([#2232](https://github.com/andes/app/issues/2232)) ([fdf70c2](https://github.com/andes/app/commit/fdf70c2093c5f89ac41c461ae84c8fce41242f33))

# [5.43.0](https://github.com/andes/app/compare/v5.42.0...v5.43.0) (2021-04-21)


### Bug Fixes

* **EP:** nombre tipo de ficha en buscador ([0040d54](https://github.com/andes/app/commit/0040d54a31523e3d7ca80a96ba919bec3c7e64a9))
* **gestor-agendas:** agrega aria-label en botoneras ([#2208](https://github.com/andes/app/issues/2208)) ([1fb92a1](https://github.com/andes/app/commit/1fb92a1797dc28ca6d714388bed21ff92720bcb8))
* **gestor-usuarios:** ajustes de perfiles ([#2218](https://github.com/andes/app/issues/2218)) ([10a0c35](https://github.com/andes/app/commit/10a0c351d4e8ec8b95479056b46d1ba68758eabe))
* **inscripcion:** cambia formato de fecha ([#2212](https://github.com/andes/app/issues/2212)) ([01f253d](https://github.com/andes/app/commit/01f253d433bdcc313ddc95824ffb254a5dbe8943))
* **mpi:**  en formulario contactos cambia patrón email ([#2227](https://github.com/andes/app/issues/2227)) ([c6c6c49](https://github.com/andes/app/commit/c6c6c49a0bab9c1cb4d855531e1b622e365ab30e))


### Features

* **BI:** biquery ficha epidemio ([c56c404](https://github.com/andes/app/commit/c56c40489a2bd7e667babfb4389061701f8d6747))
* **COM:** crea derivación como prestación ([05857da](https://github.com/andes/app/commit/05857da91665432ca23f676d9f80ab5d04b9119c))
* **epidemiologia:** buscador de ficha epidemiologica ([1974b9c](https://github.com/andes/app/commit/1974b9c604b15437ccb75b2caddb57902abc7330))
* **ficha-epdemiologica:** actualizacion ([6337034](https://github.com/andes/app/commit/6337034e98f575d633f63919a4a892a2a48e08f8))
* **ficha-epidemilogica:** Actualizacion nuevos campos ficha covid ([6f331c2](https://github.com/andes/app/commit/6f331c2fed402ad5347c2dbc67e73c892da90be3))
* **ficha-epidemio:** clear dependencias ([5d962fd](https://github.com/andes/app/commit/5d962fd87ea7c4bd6afa7aaa5cb31b344215c9b0))
* **ficha-epidemiologica:** buscador de fichas ([099fd26](https://github.com/andes/app/commit/099fd26c1161a2b8f118d61285ca080f37a90d54))
* **ficha-epidemiologica:** modifica localidades ([843069e](https://github.com/andes/app/commit/843069e39358f4d6ca874c02ac1410e89df3242e))
* **HUDS:** visualiza fichas epidemiologicas ([f22261f](https://github.com/andes/app/commit/f22261f85582c17112bddaab8b42f37b6f1258a2))
* **vac:** agregar nota en inscripcion ([#2222](https://github.com/andes/app/issues/2222)) ([237f9ce](https://github.com/andes/app/commit/237f9ce4dbd561f44bb2689582917ed7c690f16c))
* **vac:** filtro por certificado ([#2213](https://github.com/andes/app/issues/2213)) ([b3575eb](https://github.com/andes/app/commit/b3575eb0862f0eef17e7e82a28b8c88fdccfd483))
* **vac:** poder editar datos basicos si notiene paciente asociado ([#2216](https://github.com/andes/app/issues/2216)) ([8edd80f](https://github.com/andes/app/commit/8edd80f0dc7ab14246ce489fd69f2fee9e99798a))

# [5.42.0](https://github.com/andes/app/compare/v5.41.0...v5.42.0) (2021-04-14)


### Bug Fixes

* **mpi:** revalidacion de paciente ([#2183](https://github.com/andes/app/issues/2183)) ([d2c4cb8](https://github.com/andes/app/commit/d2c4cb8f9e945c2daac95d1c72821e0ec8046ab5))
* **mpi:** se corrige error al mostrar badge "sin dni" en pacietes validados menores a 5 años ([#2172](https://github.com/andes/app/issues/2172)) ([bf77ec2](https://github.com/andes/app/commit/bf77ec2cfb633325e31dbd3a8feffc68668a2b9c))
* **virtual-scroll:** corrige variables generales ([#2171](https://github.com/andes/app/issues/2171)) ([9d71238](https://github.com/andes/app/commit/9d71238b16796aa3867fd5e235e977962913d0a3))


### Features

* **ficha-epidemiologica:** nuevos campos ficha covid ([5759752](https://github.com/andes/app/commit/5759752ac3538f9c1cb9371cbc0f7c3c5229badd))
* **internacion:** notifica ruta volver a mapa de camas ([#2207](https://github.com/andes/app/issues/2207)) ([ac0b323](https://github.com/andes/app/commit/ac0b323f53730eef248b0c31dca699aa15f1f8d6))
* **mapa-camsa:** visualizar camas agrupadas por sector ([#2145](https://github.com/andes/app/issues/2145)) ([81ff32b](https://github.com/andes/app/commit/81ff32b777754402bf7f89c4d0ab04b8a75eb6d1))
* **pdp:** al refrescar la pantalla mantener sesión abierta ([#2209](https://github.com/andes/app/issues/2209)) ([ac7dd18](https://github.com/andes/app/commit/ac7dd187480c774e8c1e73decc532e1e4528503f))
* **pdp:** visualizar mis laboratorios ([#2188](https://github.com/andes/app/issues/2188)) ([9cd3708](https://github.com/andes/app/commit/9cd37081ebb5d2e0439ceed6687180c4a4fedb59))
* **pdp:** visualizar mis turnos actuales ([#2191](https://github.com/andes/app/issues/2191)) ([bb6d44b](https://github.com/andes/app/commit/bb6d44bfe562b0b02d218c07e79d24e7a1a3a6d4))
* **pdp:** visualizar mis vacunas ([#2187](https://github.com/andes/app/issues/2187)) ([fdddf15](https://github.com/andes/app/commit/fdddf1599ab3051389f03caac31fc2f5e4b8a84b))

# [5.41.0](https://github.com/andes/app/compare/v5.40.0...v5.41.0) (2021-04-07)


### Features

* **inscripcion:** Agrega morbilidades ([#2194](https://github.com/andes/app/issues/2194)) ([7075a6c](https://github.com/andes/app/commit/7075a6cd46b96c0e6a5b9c1cd45d2a825aefdd5f))
* **inscripcion-profesionales:** agrega imagenes nro de trmite ([#2179](https://github.com/andes/app/issues/2179)) ([89400b0](https://github.com/andes/app/commit/89400b0932579fe0f7638999edb643672b3ee585))
* **vac:** mostrar los datos del inscripto al consultar por la inscripción ([#2192](https://github.com/andes/app/issues/2192)) ([14f5890](https://github.com/andes/app/commit/14f589075d046dabe2d2a3f3da592fa32a57ea60))
* **vac:** nuevo acceso a consultas de inscripción ([#2193](https://github.com/andes/app/issues/2193)) ([287726c](https://github.com/andes/app/commit/287726c64acabd451e1ff57cdbf80aa0b8945d71))
* **vac:** reduce peso de imagen 1.3Mb => 260Kb ([#2189](https://github.com/andes/app/issues/2189)) ([4bdf1d6](https://github.com/andes/app/commit/4bdf1d6a963e3df15df1a3cecb5ccfb874b7bd84))
* **vac:** responsive, se mejora subtítulo ppal ([#2190](https://github.com/andes/app/issues/2190)) ([37dd3ac](https://github.com/andes/app/commit/37dd3acbf375e11c9537703b8e5d15cd67f7fcbc))

# [5.40.0](https://github.com/andes/app/compare/v5.39.0...v5.40.0) (2021-03-31)


### Bug Fixes

* **citas:** type permisos ([#2185](https://github.com/andes/app/issues/2185)) ([ffb7686](https://github.com/andes/app/commit/ffb7686f1b849859e9b6d303a3b3e3fdf483f6dd))
* **rup:** controles de fechas ([#2173](https://github.com/andes/app/issues/2173)) ([f6128f4](https://github.com/andes/app/commit/f6128f4641f2391b86e5fc5ad5ad97126bd03791))


### Features

* **pdp:** estructura inicial routing ([#2195](https://github.com/andes/app/issues/2195)) ([0587d78](https://github.com/andes/app/commit/0587d78c0bf327b895cd418f5c9c322551c5be69))
* **plex:** v7.14 ([#2176](https://github.com/andes/app/issues/2176)) ([da57a97](https://github.com/andes/app/commit/da57a97a4661189d7fde30e5922026a801364514))
* **top:** control de fechas vacias ([#2186](https://github.com/andes/app/issues/2186)) ([188681f](https://github.com/andes/app/commit/188681fd90d8822be9fe01d6a48bf353ef35c267))
* **top:** se suma estado ejecución a filtros en solicitudes ([#2166](https://github.com/andes/app/issues/2166)) ([346104f](https://github.com/andes/app/commit/346104f3c9f4104fca6ad170b4413bb240d2a66b))

# [5.39.0](https://github.com/andes/app/compare/v5.38.0...v5.39.0) (2021-03-24)


### Bug Fixes

* **vac:** arrelgo de seteo de fechas cuando el grupo viene por parámetro ([#2175](https://github.com/andes/app/issues/2175)) ([145df10](https://github.com/andes/app/commit/145df107d779282e065e70e3484613a409bbacdc))
* **VAC:** agrega variable para resguardar los factores de riesgo seleccionados en caso de error ([#2181](https://github.com/andes/app/issues/2181)) ([e3c3df3](https://github.com/andes/app/commit/e3c3df323daf59c5b140ee2ae9f4686096b732f9))


### Features

* **inscripcion:** agrega control de edad mayor a 18 en grupo policia y personal de salud ([#2177](https://github.com/andes/app/issues/2177)) ([dbb33d5](https://github.com/andes/app/commit/dbb33d5070dff11eff9ea205985f13aa595a996d))
* **VAC:** agrega imágenes de número de trámite ([#2165](https://github.com/andes/app/issues/2165)) ([871e8eb](https://github.com/andes/app/commit/871e8eb25e1a9883f783c0fe790a1aee36cee8c9))

# [5.38.0](https://github.com/andes/app/compare/v5.37.0...v5.38.0) (2021-03-17)


### Bug Fixes

* **VAC:** Agrega la selección de factores de riesgo en la inscripción ([#2164](https://github.com/andes/app/issues/2164)) ([4f28281](https://github.com/andes/app/commit/4f282812870f87c4d8d33b952718607e2cda2038))


### Features

* **vac:** formulario segun grupo poblacional ([#2158](https://github.com/andes/app/issues/2158)) ([b30e044](https://github.com/andes/app/commit/b30e044a9b4faeead7d4b1490a0c537f10b11868))
* **vac:** variable para deshabilitar control de captcha ([#2155](https://github.com/andes/app/issues/2155)) ([3099dbf](https://github.com/andes/app/commit/3099dbf0306f736bc1e59b54f318276e737fddb3))

# [5.37.0](https://github.com/andes/app/compare/v5.36.0...v5.37.0) (2021-03-10)


### Bug Fixes

* **discapacidad:** quita restricción a grupo discapacidad para limite de edad maxima ([01c562e](https://github.com/andes/app/commit/01c562e7b7555ae1a5b9ffa0b3e34eaf3b7d47ad))
* **epidemiologia:** boton general para registrar ficha ([b8cbb4f](https://github.com/andes/app/commit/b8cbb4f6ad38db2f43ea960560efce549c7557f1))
* **epidemiologia:** change fichas, virtualScroll ([caba926](https://github.com/andes/app/commit/caba9267981baa008d82acca80008537f953ad24))
* **ficha-epidemiologica:** agregamos información que falta en el test ([#2154](https://github.com/andes/app/issues/2154)) ([a76dda1](https://github.com/andes/app/commit/a76dda16088fa0e6a0f2753ef7edbad1ad284580))
* **form-crud:** modificamos campos de acuerdo a nueva actualizacion de api ([2741d5a](https://github.com/andes/app/commit/2741d5a45083e23a6082fb184e1fce943a923082))
* **forms-crud:** altura extra para plex-select ([6387bf3](https://github.com/andes/app/commit/6387bf322045924223b156f693e9be07ced7735d))
* **mapa-camas:** movimientos en listado internacion ([#2159](https://github.com/andes/app/issues/2159)) ([33c3363](https://github.com/andes/app/commit/33c3363fe9d83d5f18719e3df0b46df5cdcfc914))
* **RUP:** Se agrega un control en vacunas para saber si se debe hacer el chequeo interdosis o no ([#2160](https://github.com/andes/app/issues/2160)) ([0f9eb70](https://github.com/andes/app/commit/0f9eb709bf40313f404b28d825a5a2993e3ee31b))


### Features

* **epidemiologia:** agrego component seccion ([b211b69](https://github.com/andes/app/commit/b211b69af9c8eb598a265f8b8c04d616f84ed8d6))
* **epidemiologia:** nueva seccion ([f0d8219](https://github.com/andes/app/commit/f0d821963cf2fd89b519d7f42e84d012e2234bdf))
* **epidemiologia:** nueva tabla contactosEstrechos ([f08fe87](https://github.com/andes/app/commit/f08fe878b3edc39c7ae4bc02e060d251d4b06727))
* **epidemiologia:** nuevo modulo y ficha-epidemiologica component ([c509bba](https://github.com/andes/app/commit/c509bba4ba585352fed0e9b306cc5731d6f9d4d3))
* **epidemiologia:** save y update ficha ([02f02a4](https://github.com/andes/app/commit/02f02a4220447f5a2d3bd94d8ea7fe227800cefb))
* **epidemiologia:** table contactos estrechos ([c84018b](https://github.com/andes/app/commit/c84018bc0616de44635ba9b6efdabefe62b7cca0))
* **epidemiologia:** table contactos estrechos ([b4b7998](https://github.com/andes/app/commit/b4b79986338f28506c4f6219143b1bcd6385db51))
* **ficha-epidemio:** altura formBuilder, ficha-crud, permisos ([c4365da](https://github.com/andes/app/commit/c4365da255234f9cfab654d68416dfa64061f7a3))
* **formBuilder:** Add snomed codification to fields and form ([9e6f995](https://github.com/andes/app/commit/9e6f995134c3b1364c648fbad6c2296d684a2c95))
* **formBuilder:** add type table ([1fba268](https://github.com/andes/app/commit/1fba2687e25d789d258ac6e56826bcfd41649564))
* **formBuilder:** agregamos plex-table y fixeamos algunos detalles ([5405a17](https://github.com/andes/app/commit/5405a17b2d0eb9be392756f666d4fa9f80cdb9c5))
* **formBuilder:** formulario generico se le agregan secciones por campo ([1cffe2f](https://github.com/andes/app/commit/1cffe2ff1958b2a9c274646a6bab27f0e4febde1))
* **formBuilder:** primer commit ([cf21663](https://github.com/andes/app/commit/cf216631b676c2b1c1d141e366a4b01a07fbf4a5))
* **formBuilder:** set subfilter false by default ([0dde344](https://github.com/andes/app/commit/0dde344d1d86193fa55dfb746e6d3c65bc2029a1))
* **forms:** Add phone option ([12a7a27](https://github.com/andes/app/commit/12a7a270a1dccc3c18043e8bd238a18d3144dbce))
* **mpi:** reemplaza toast de ciudadano no encontrado ([#2146](https://github.com/andes/app/issues/2146)) ([491715b](https://github.com/andes/app/commit/491715b51beda6b902cd914e477ab5dd5291ac66))
* **rup:** ajuste visual botones en ejecucion ([#2151](https://github.com/andes/app/issues/2151)) ([fe4ef33](https://github.com/andes/app/commit/fe4ef33e70d76ada936c9553a52be453f1ecddb4))


### Performance Improvements

* **turnos-prestaciones:** maximo de prestaciones para exportar ([#2150](https://github.com/andes/app/issues/2150)) ([4725e23](https://github.com/andes/app/commit/4725e23c1c0cdb2fa74d4cca3039c7c41d0ba03e))

# [5.36.0](https://github.com/andes/app/compare/v5.35.0...v5.36.0) (2021-03-03)


### Bug Fixes

* **mapa-camas:** filtrar sectores a partir de la unidad organizativa ([#2147](https://github.com/andes/app/issues/2147)) ([58b6d5b](https://github.com/andes/app/commit/58b6d5ba99dc6627dc5f77c1e179cf61135997fe))
* **mpi:** bug update contactos ventanilla ([#2148](https://github.com/andes/app/issues/2148)) ([0bf64ce](https://github.com/andes/app/commit/0bf64ceb9a208c7036342de9b7f59fc40e06cf21))
* **mpi:** edicion de contactos ([#2141](https://github.com/andes/app/issues/2141)) ([f403de5](https://github.com/andes/app/commit/f403de534c18649287cf33d26634bdbc0a43a82e))
* **mpi:** salva valor de scan utilizado en la busqueda ([#2124](https://github.com/andes/app/issues/2124)) ([8f8faca](https://github.com/andes/app/commit/8f8facab6ae278ca9112dd0c8bf2819a990eec58))
* **rup:** ajuste encolumnado secciones ([8ac0101](https://github.com/andes/app/commit/8ac01016b0f1e6611dd48aff2a2524f37489573c))
* **rup:** fecha de ejecucion del turno ([#2142](https://github.com/andes/app/issues/2142)) ([759b45e](https://github.com/andes/app/commit/759b45eadc806c3d63340ddfd0d4c8a2ff58eb3a))


### Features

* **carpetas:** filtro prestaciones y componentes plex ([#2144](https://github.com/andes/app/issues/2144)) ([7b998ff](https://github.com/andes/app/commit/7b998fff6222a994d7c21a8069f73f77bf008f21))
* **mpi:** documentos paciente ([#2116](https://github.com/andes/app/issues/2116)) ([3b0a585](https://github.com/andes/app/commit/3b0a5850c5b394c94bd2021416c3469a3fb57612))
* **rup:** mantiene el formato de texto en las diferentes pest… ([#2135](https://github.com/andes/app/issues/2135)) ([53934da](https://github.com/andes/app/commit/53934da19c0a250fb7fad9a5d35a0f160146dca0))

# [5.35.0](https://github.com/andes/app/compare/v5.34.0...v5.35.0) (2021-02-24)


### Bug Fixes

* **mpi:** check validado activo ([#2139](https://github.com/andes/app/issues/2139)) ([003500c](https://github.com/andes/app/commit/003500ca1b5f3a34e42a78c0def981827f2366d4))


### Features

* **citas:** se agrega permiso soloLectura ([#2114](https://github.com/andes/app/issues/2114)) ([ef227f0](https://github.com/andes/app/commit/ef227f0c8520af01d40307bfb92ab6ca24b50e82))
* **mapa-camas:** varios ajustes ([#2133](https://github.com/andes/app/issues/2133)) ([16fbab5](https://github.com/andes/app/commit/16fbab5a00ca31e59c108defebb44b759e525659))
* **rup:** incorpora componentes plex a vista prestacion ([#2134](https://github.com/andes/app/issues/2134)) ([3d45474](https://github.com/andes/app/commit/3d454742068e93d81db6f9238ff651daa10c0df7))

# [5.34.0](https://github.com/andes/app/compare/v5.33.0...v5.34.0) (2021-02-17)


### Bug Fixes

* **top:** permite modificar profesional al dar turno ([#2125](https://github.com/andes/app/issues/2125)) ([b8fdd00](https://github.com/andes/app/commit/b8fdd0077b9a92161c0c3d9b1b34c695f8f007d3))


### Features

* **mpi:** Aviso ante selección de paciente fallecido ([#2132](https://github.com/andes/app/issues/2132)) ([8ebd0ee](https://github.com/andes/app/commit/8ebd0ee1983070e130843e7f793526b77726c429))

# [5.33.0](https://github.com/andes/app/compare/v5.32.1...v5.33.0) (2021-02-10)


### Bug Fixes

* **citas:** solapamiento de turnos en agendas dinamicas ([#2129](https://github.com/andes/app/issues/2129)) ([0775fab](https://github.com/andes/app/commit/0775fab346944fd13f419d354355c9f528d82d4a))


### Features

* **citas:** activar/desactivar envio de mensajes de una agenda ([#2115](https://github.com/andes/app/issues/2115)) ([68df51f](https://github.com/andes/app/commit/68df51f73bd48f3c00aa86c78c0e8425904e691d))
* **COM:** incluye traslados especiales ([6e38715](https://github.com/andes/app/commit/6e38715bbef61744f9abad549eb2633ce1433acb))
* **huds:** agrega filtro organizaciones ([#2128](https://github.com/andes/app/issues/2128)) ([bf38f84](https://github.com/andes/app/commit/bf38f843c8e34e1f3b73ca2223380307b15a9f09))
* **mapa-camas:** nuevo pase de UO configurable por maquina de estados ([#2074](https://github.com/andes/app/issues/2074)) ([7e028e4](https://github.com/andes/app/commit/7e028e43893598a54ce38349e82d15e08e32f196))
* **rup:** cambia a lote tabulado en vacunacion ([#2121](https://github.com/andes/app/issues/2121)) ([51cfdbb](https://github.com/andes/app/commit/51cfdbb0d3ecfe2adfffe6c7360b97dfa4ee198c))
* **top:** poder guardar solicitudes sin profesional de origen ([#2127](https://github.com/andes/app/issues/2127)) ([ea287ed](https://github.com/andes/app/commit/ea287ede7a328285c2574ecc7e787e56cba5f0b9))

## [5.32.1](https://github.com/andes/app/compare/v5.32.0...v5.32.1) (2021-02-03)


### Bug Fixes

* **mpi:** corrige bug de fotoId al obtenerlo de la validacion ([#2123](https://github.com/andes/app/issues/2123)) ([5e1bce3](https://github.com/andes/app/commit/5e1bce3d6be83691ed660b7944aa63858ca6ab78))
* **mpi:** reemplaza busqueda match por get ([#2120](https://github.com/andes/app/issues/2120)) ([937a3db](https://github.com/andes/app/commit/937a3dbd93b7f269429ec0b8a8f4aa9672dd00be))

# [5.32.0](https://github.com/andes/app/compare/v5.31.0...v5.32.0) (2021-01-27)


### Bug Fixes

* **core:** carga de archivos con extension en mayuscula ([#2117](https://github.com/andes/app/issues/2117)) ([be7731d](https://github.com/andes/app/commit/be7731d71fe475883171cf6635c00046ed01c657))


### Features

* **citas:** mostrar quien da el turno en revisión de agenda ([#2110](https://github.com/andes/app/issues/2110)) ([67881ca](https://github.com/andes/app/commit/67881caf864d5ca5290723c3407866b62ae86bec))
* **mapa-camas:** agrega operacion para prestar y devolver camas ([#2107](https://github.com/andes/app/issues/2107)) ([6e9fb21](https://github.com/andes/app/commit/6e9fb210778d44e4ee8d82a7678895c4892cdc8a))
* **mapa-camas:** listado internaciones capa medica ([#2112](https://github.com/andes/app/issues/2112)) ([485ef13](https://github.com/andes/app/commit/485ef13ebcc4115f96556833f82e045c0bea9ae1))

# [5.31.0](https://github.com/andes/app/compare/v5.30.0...v5.31.0) (2021-01-20)


### Bug Fixes

* **mpi:** foto paciente directiva ([#2106](https://github.com/andes/app/issues/2106)) ([ef5cfb1](https://github.com/andes/app/commit/ef5cfb110dac77166b1cf21d1bfcc173d6379c0f))
* **rup:**  modifica control de dias ([#2108](https://github.com/andes/app/issues/2108)) ([7f99526](https://github.com/andes/app/commit/7f995260a024a1b0d23f5eb4af650f819623bd65))
* **rup:** quita loads de esquemas y vacunas ([#2111](https://github.com/andes/app/issues/2111)) ([421c8a5](https://github.com/andes/app/commit/421c8a5777558dc5f2af1e4390cda55fd950f586))
* **vacunas:** fix en la condicion de timepo interdosis ([#2109](https://github.com/andes/app/issues/2109)) ([cc7fc63](https://github.com/andes/app/commit/cc7fc63374868c54a3d0a286443a9a71bc0b0f5c))


### Features

* **guardia:** primeros pasos ([#2071](https://github.com/andes/app/issues/2071)) ([c40206d](https://github.com/andes/app/commit/c40206d7621a5ee5593d41191ab72459cdf97963))

# [5.30.0](https://github.com/andes/app/compare/v5.29.0...v5.30.0) (2021-01-13)


### Features

* **auth:** e agrega la posibilidad resetear la contraseña para los usuarios externos (no OneLogin) ([#2093](https://github.com/andes/app/issues/2093)) ([8dcf7ec](https://github.com/andes/app/commit/8dcf7ec2c52c31172e55da12b6a98edbf16decd1))
* **mapa-camas:** control request en ingresos ([#2104](https://github.com/andes/app/issues/2104)) ([c1491e6](https://github.com/andes/app/commit/c1491e6a2095ea7dfbe07a0f369961706e29730f))
* **rup:** cambia a drive los archivos adjuntos ([#2105](https://github.com/andes/app/issues/2105)) ([725702a](https://github.com/andes/app/commit/725702a106bb2ddb695ea58f1fd60737ca23ce67))
* **rup:** opción otros para checklist ([#2102](https://github.com/andes/app/issues/2102)) ([8736e66](https://github.com/andes/app/commit/8736e6670be34597a2011f1343c1c4927037a9ae))
* **tm:** toast success en sincro sisa de organizacion ([#2098](https://github.com/andes/app/issues/2098)) ([547e2c9](https://github.com/andes/app/commit/547e2c9875469841cbd3b19efe0e182d976afbbb))

# [5.29.0](https://github.com/andes/app/compare/v5.28.0...v5.29.0) (2021-01-06)


### Bug Fixes

* **com:** arreglo al actualizar datos simultaneamente ([#2099](https://github.com/andes/app/issues/2099)) ([e3dee03](https://github.com/andes/app/commit/e3dee03bfe598aa892ff69a9a955b97f194c5d5e))
* **com:** filtra las derivaciones canceladas ([#2097](https://github.com/andes/app/issues/2097)) ([471cf06](https://github.com/andes/app/commit/471cf06ebb89bed2387dd33ce8131998878fc016))
* **rup:** mapeo situaciones ([#2101](https://github.com/andes/app/issues/2101)) ([31ac62e](https://github.com/andes/app/commit/31ac62e1edb3143c5347ffd8e0623088862b10b3))


### Features

* **chore:** activa ivy ([#2088](https://github.com/andes/app/issues/2088)) ([629da4a](https://github.com/andes/app/commit/629da4a1e98a95ec2c08ffafec562bb52afdb3e0))
* **com:** permitir modificar la prioridad ([#2100](https://github.com/andes/app/issues/2100)) ([0812b6d](https://github.com/andes/app/commit/0812b6d3da85287fe3a2249e0a3476f51a5285f2))
* **mpi:** se guarda el número de trámite del dni al validar un paciente ([#2085](https://github.com/andes/app/issues/2085)) ([2d8e7e2](https://github.com/andes/app/commit/2d8e7e2d4f4aa161bc105f17b993fb04745f938e))
* **rup:** agrega control en dosis ([#2095](https://github.com/andes/app/issues/2095)) ([9fd5a36](https://github.com/andes/app/commit/9fd5a36036da75f019cc55458a94163c5b631a1a))
* **rup:** plantillas moleculas ([#2096](https://github.com/andes/app/issues/2096)) ([aa93db8](https://github.com/andes/app/commit/aa93db8fcf961c0617b2451d73088db250ee2606))

# [5.28.0](https://github.com/andes/app/compare/v5.27.0...v5.28.0) (2020-12-30)


### Features

* **mapa-camas:** controles de networking ([#2092](https://github.com/andes/app/issues/2092)) ([1c97cb7](https://github.com/andes/app/commit/1c97cb790a0ba761d107d5907c1d82eea01a846d))
* **rup:** envios adjuntos ([#1848](https://github.com/andes/app/issues/1848)) ([24cf9eb](https://github.com/andes/app/commit/24cf9eb85d31b473e9847da127cc1ec22eb544cb))
* **RUP:** Agregar registro de vacuna covid ([#2094](https://github.com/andes/app/issues/2094)) ([2328c5c](https://github.com/andes/app/commit/2328c5c4ee8dc0e69f2d279c57af7165e1b6e23d))
* **top:** subir archivos a andesDrive ([#2089](https://github.com/andes/app/issues/2089)) ([b43be2c](https://github.com/andes/app/commit/b43be2c413ef6cb99ea6f61257fdbaff24950365))
* **turnos-prestaciones:** ambito y virtual scroll ([#2091](https://github.com/andes/app/issues/2091)) ([4f71dcc](https://github.com/andes/app/commit/4f71dcc6ac0369b97fb6d697ead010a5086c2374))

# [5.27.0](https://github.com/andes/app/compare/v5.26.0...v5.27.0) (2020-12-23)


### Features

* **gdu:** feedback al usuario cuando no encuentra resultados ([#2090](https://github.com/andes/app/issues/2090)) ([bcea8cb](https://github.com/andes/app/commit/bcea8cb5fb672d8c14f637d1a85d8624e21b5e50))
* **top:** mostrar cantidad solicitudes ([#2080](https://github.com/andes/app/issues/2080)) ([989b171](https://github.com/andes/app/commit/989b171227245ce4eabbbbf64e4b864071286241))

# [5.26.0](https://github.com/andes/app/compare/v5.25.0...v5.26.0) (2020-12-16)


### Bug Fixes

* **citas:** poder seleccionar prepaga cuando el paciente no tiene obra social ([#2079](https://github.com/andes/app/issues/2079)) ([e529d43](https://github.com/andes/app/commit/e529d438c0742bcf2cf0c0e9f0ee0d2061f961e5))
* **mapa-camas:** agrega control para los registros si la uo es null  ([#2087](https://github.com/andes/app/issues/2087)) ([757fbf1](https://github.com/andes/app/commit/757fbf1645a428ed8fcc339b81b87eb406f838d5))
* **mapa-camas:** controla que se haya generado el censo para descargarlo ([#2081](https://github.com/andes/app/issues/2081)) ([e13d869](https://github.com/andes/app/commit/e13d869d8ed006ebdc1f138700c183a6190da3ad))
* **mpi:** edicion de datos de paciente en modal ([#2083](https://github.com/andes/app/issues/2083)) ([3bde806](https://github.com/andes/app/commit/3bde806664f3c1ce19fa795879d6d3a11e2d9cab))


### Features

* **bi-query:** organizacion required ([#2072](https://github.com/andes/app/issues/2072)) ([24f9ad4](https://github.com/andes/app/commit/24f9ad4e2818bb7a57bd2e6d854f4b3b4a38fed2))
* **buscador:** exportar huds ([#2055](https://github.com/andes/app/issues/2055)) ([896f786](https://github.com/andes/app/commit/896f786be12e505caf1a491ecf482e4979fd4984))
* **CIT:** mostrar espacio fisico dacion turno ([#2082](https://github.com/andes/app/issues/2082)) ([2b1cc7d](https://github.com/andes/app/commit/2b1cc7d7d7a4994a29309dcfdbdb5b329aeefcea))
* **CIT:** registrar motivo liberacion turno ([#2078](https://github.com/andes/app/issues/2078)) ([5586923](https://github.com/andes/app/commit/5586923e2452fc57f9f461dc28e68dc1913af85e))
* **com:** borrar archivos del drive al eliminar de la galería ([#2084](https://github.com/andes/app/issues/2084)) ([226c23c](https://github.com/andes/app/commit/226c23ce873509def9353abe6162c67a436823e7))
* **huds:** mostrar adjuntos si esta relacionado ([#2077](https://github.com/andes/app/issues/2077)) ([97fb17f](https://github.com/andes/app/commit/97fb17fca179c30484f65d3fbe8914dbef35cfe8))

# [5.25.0](https://github.com/andes/app/compare/v5.24.0...v5.25.0) (2020-12-09)


### Bug Fixes

* **mpi:** permite dni con 5 digitos ([#2073](https://github.com/andes/app/issues/2073)) ([91ddf87](https://github.com/andes/app/commit/91ddf878831cf61e18f2d6cbd56d14ffa945c4dc))


### Features

* **CIT:** refactor arancelamiento ([#2032](https://github.com/andes/app/issues/2032)) ([c12d0db](https://github.com/andes/app/commit/c12d0dbed64bfac8541883e14695657ba98c4dfb))
* **huds:** agregar links a otros registros y a prestación ([#2070](https://github.com/andes/app/issues/2070)) ([5641117](https://github.com/andes/app/commit/5641117d61f35cf0fd344b4893d9a20c6f04b43d))

# [5.24.0](https://github.com/andes/app/compare/v5.23.0...v5.24.0) (2020-12-02)


### Bug Fixes

* **cit:** Cannot read property nombre of undefined at showArancelamiento ([#2042](https://github.com/andes/app/issues/2042)) ([c6a253a](https://github.com/andes/app/commit/c6a253a67e57f1f924d139a495c4ee47a33ee8df))
* **dashoard:** fix huds select prestaciones ([#2066](https://github.com/andes/app/issues/2066)) ([b227233](https://github.com/andes/app/commit/b2272331fab6c76ad6785027e51477be787702bd))
* **mapa-camas:** controla las subscripciones en los ngOnDestroy ([#2059](https://github.com/andes/app/issues/2059)) ([496a519](https://github.com/andes/app/commit/496a519c2fcaadb88fe20cf2f4c5c047e8caa032))
* **mapa-camas:** controla que la fecha desde esté inicializada ([#2065](https://github.com/andes/app/issues/2065)) ([0bdaa50](https://github.com/andes/app/commit/0bdaa5059bdc60e60f3300832610fbf7f97c2f25))
* **mapa-camas:** no se ve el boton de censo ([#2063](https://github.com/andes/app/issues/2063)) ([fdcddb8](https://github.com/andes/app/commit/fdcddb8ffa6b3f344b9c3e398a622ff84b22258f))


### Features

* **com:** evitar cargar derivaciones si hay otra en curso para el paciente ([#2052](https://github.com/andes/app/issues/2052)) ([a8cc9a2](https://github.com/andes/app/commit/a8cc9a2135a1bf9414255f88511d1a7c698051ce))
* **com:** mostrar gravedad solo a usuarios del COM ([#2051](https://github.com/andes/app/issues/2051)) ([316f896](https://github.com/andes/app/commit/316f8968f5166d33553e91e5cb70383afeef03d7))
* **elementos-rup:** add rules ([#2061](https://github.com/andes/app/issues/2061)) ([db2ebfd](https://github.com/andes/app/commit/db2ebfdd43b6c18793a07807ff4b51c7c60e0940))
* **huds:** agrega ámbito al visualizar registro y prestación ([#2058](https://github.com/andes/app/issues/2058)) ([4d3a1ac](https://github.com/andes/app/commit/4d3a1ac4ed1cd38991673f985fcdf25f05c2e301))
* **rup:** atomo checkList ([#1951](https://github.com/andes/app/issues/1951)) ([47ef8ef](https://github.com/andes/app/commit/47ef8ef5ac0d234e67f1e3d1c1649d23ab4ffc2e))

# [5.23.0](https://github.com/andes/app/compare/v5.22.0...v5.23.0) (2020-11-25)


### Bug Fixes

* **mapa-camas:** muestra fecha correcta al editar egreso ([#2054](https://github.com/andes/app/issues/2054)) ([be50386](https://github.com/andes/app/commit/be503862267e50583d58fb96dd667e8d6b735264))
* **mpi:** deshabilitar campos durante validación ([#2034](https://github.com/andes/app/issues/2034)) ([3f9e7da](https://github.com/andes/app/commit/3f9e7dac7393e5a3c50ea26c7e59dae75fa65c32))


### Features

* **com:** scroll infinito en punto de inicio ([#2030](https://github.com/andes/app/issues/2030)) ([18c6f86](https://github.com/andes/app/commit/18c6f862ea60d1b2bc0f511a9bb384af9fa97d6c))
* **mapa-camas:** cambia ruteo del mapa de camas para adaptar el ambito ([#1973](https://github.com/andes/app/issues/1973)) ([d34c0c8](https://github.com/andes/app/commit/d34c0c81781fde04896e784729a083f066d03ea4))
* **mapa-camas:** permisos por ambito([#2049](https://github.com/andes/app/issues/2049)) ([b92b92d](https://github.com/andes/app/commit/b92b92d65672db3df214ab41fd7ef781a2c89f42))
* **shared:** crea componente galeria ([#2045](https://github.com/andes/app/issues/2045)) ([75a7e42](https://github.com/andes/app/commit/75a7e4294577c893610b418ca5ca8c4624a04e8c))

# [5.22.0](https://github.com/andes/app/compare/v5.21.0...v5.22.0) (2020-11-18)


### Bug Fixes

* **rup:** cannot read comoSeProdujo of undefined ([#2046](https://github.com/andes/app/issues/2046)) ([a6a1897](https://github.com/andes/app/commit/a6a1897f44b3e4a945039800941dd7f073e5b21c))
* **rup:** error en fecha ([#2035](https://github.com/andes/app/issues/2035)) ([fadb382](https://github.com/andes/app/commit/fadb382da34152b15ff4a55b7a674c24b3e34ba0))
* **rup:** vista-prestacion se visualizan mal las relaciones y diagnostico ([202b680](https://github.com/andes/app/commit/202b6804d0ce4be1765f8c75837161f85266beed))


### Features

* **CIT:** bagde fuera de agenda ([#1966](https://github.com/andes/app/issues/1966)) ([7c6cb90](https://github.com/andes/app/commit/7c6cb90e66b69b95944a5a62e2e2ff6138ec26e6))
* **com:** impresión de comprobante ([#2039](https://github.com/andes/app/issues/2039)) ([64826bd](https://github.com/andes/app/commit/64826bd570e1ca5f3a88a898ee6eab2c792b3833))
* **com:** permitir sumar nota a origen/destino ([#2031](https://github.com/andes/app/issues/2031)) ([09b8aa3](https://github.com/andes/app/commit/09b8aa31490f673d9bb32aca6db4da7d1c10aba6))
* **com:** sumar gravedad al habilitar una derivación desde el com ([#2025](https://github.com/andes/app/issues/2025)) ([568002f](https://github.com/andes/app/commit/568002fb270b516b9cfcc32d8f47dbd04a594916))
* **inicio:** mejoras de layout ([#2018](https://github.com/andes/app/issues/2018)) ([73dfcb1](https://github.com/andes/app/commit/73dfcb1245c0061d2617e74e830029dd737e8f36))
* **movimientos:** deshabilita el boton para evitar el doble click ([#2029](https://github.com/andes/app/issues/2029)) ([50f7ce9](https://github.com/andes/app/commit/50f7ce9fbc181011cd686c41a62efd74d033382c))
* **rup:** complete Subject before delete ([#2036](https://github.com/andes/app/issues/2036)) ([f39d462](https://github.com/andes/app/commit/f39d462704de16709cf5ebd2d8c829648c4431c9))
* **rup:** componente receta médica ([#1905](https://github.com/andes/app/issues/1905)) ([8f1266e](https://github.com/andes/app/commit/8f1266ec91be5be8350aeda4b540086a88f3601b))
* **rup:** enviar por email hallazgo/trastorno ([#2037](https://github.com/andes/app/issues/2037)) ([12c8282](https://github.com/andes/app/commit/12c8282eff3bb9351cb6703a4d94efa73bf786a5))
* **top:** uso de paciente detalle en detalle solicitud ([#2015](https://github.com/andes/app/issues/2015)) ([c184354](https://github.com/andes/app/commit/c18435440f15a2389667918e62f7c03a8cf26091))
* **TOP:** remueve referidas de busqueda de entrada ([#2041](https://github.com/andes/app/issues/2041)) ([26f41bd](https://github.com/andes/app/commit/26f41bd109df4dcafed3bf7d79a9effdf194faab))

# [5.21.0](https://github.com/andes/app/compare/v5.20.0...v5.21.0) (2020-11-11)


### Bug Fixes

* **chore:** chunk error ([#2020](https://github.com/andes/app/issues/2020)) ([ce45335](https://github.com/andes/app/commit/ce453353f8e78309dcce1eba1970be793573a5cf))
* **dasboar-huds:** prestaciones hijas y encabezado de tabla ([#2026](https://github.com/andes/app/issues/2026)) ([240fecf](https://github.com/andes/app/commit/240fecf7607c1cf1125c7c18f92d24cc263114fd))
* **mpi:** corrige validacion de paciente existente sin direccion ([#2017](https://github.com/andes/app/issues/2017)) ([ae296c5](https://github.com/andes/app/commit/ae296c56cbfa3e5fc411a2ccc6e6360c0f73cd55))
* **rup:** Corrige carga de acceso a huds iniciando prestacion ([#1939](https://github.com/andes/app/issues/1939)) ([7cec1d5](https://github.com/andes/app/commit/7cec1d5fc1ce19940bdef22660e0a2f032dc1b9f))
* **rup:** fecha limite fuera agenda ([474265a](https://github.com/andes/app/commit/474265aec2d174ebb220ee5b2bf36373dde1affd))
* **rup:** relaciones no se guarda como ID ([#1970](https://github.com/andes/app/issues/1970)) ([7644ffc](https://github.com/andes/app/commit/7644ffcaba37f61bb93bcdd12672669a01e08c35))
* **TOP:** realiza cambio en condiciones para anular solicitudes ([#2022](https://github.com/andes/app/issues/2022)) ([588bf77](https://github.com/andes/app/commit/588bf77f72d1c9b426f5852ee1625c40323d69c2))


### Features

* **mpi:** IntersectionObserverApi foto paciente ([#2027](https://github.com/andes/app/issues/2027)) ([5f06022](https://github.com/andes/app/commit/5f0602258ca5c5c477c300e9e990a28c3f3a2965))
* **rup:** drag and drop conceptos de la HUDS (trastornos) ([#2023](https://github.com/andes/app/issues/2023)) ([c2c237f](https://github.com/andes/app/commit/c2c237f6871bf48a30759ca88c993e3487f9f3f6))
* **top:** tab para historial en detalle ([#1958](https://github.com/andes/app/issues/1958)) ([3bbce99](https://github.com/andes/app/commit/3bbce999aa012ac989c2b1bf352619854ce42a7c))
* **turnos-prestaciones:** columnas dinamicas  ([#1978](https://github.com/andes/app/issues/1978)) ([77cc047](https://github.com/andes/app/commit/77cc0474b6e62a6f9f64aabafddcca082647e6e3))

# [5.20.0](https://github.com/andes/app/compare/v5.19.0...v5.20.0) (2020-11-04)


### Bug Fixes

* **dasboard:** permisos ([#2011](https://github.com/andes/app/issues/2011)) ([fde7a97](https://github.com/andes/app/commit/fde7a970ee2a3a3143c7e02764f6d85aec2934d0))
* **mapa-camas:** corrige accion saltar al presente que quitaba la fecha ([#2005](https://github.com/andes/app/issues/2005)) ([209a991](https://github.com/andes/app/commit/209a9911697e3c29211b3d0954d6f119840f6e94))
* **menu:** filtra en permisos múltiples ([#1982](https://github.com/andes/app/issues/1982)) ([279e0d0](https://github.com/andes/app/commit/279e0d07facd0d75ba4045e76be857cb99064b16))
* **mpi:** error en busqueda de pacientes auditoria ([#2003](https://github.com/andes/app/issues/2003)) ([6c64d9f](https://github.com/andes/app/commit/6c64d9fb9da4413b7931bae9e66317db4ee9eb8b))
* **novedades:** se separa array de novedades ([#1985](https://github.com/andes/app/issues/1985)) ([b6aedda](https://github.com/andes/app/commit/b6aeddab16c339c5454cfeec0f52c4695a33a19d))
* **rup:** control de fecha en fuera de agenda ([#2012](https://github.com/andes/app/issues/2012)) ([46d2094](https://github.com/andes/app/commit/46d2094c24f913a28910d58bc078e9d99132940a))
* **rup:** error al guardar turno ([#2007](https://github.com/andes/app/issues/2007)) ([0184599](https://github.com/andes/app/commit/018459930378e7ab67c99b9ba40a804dd278fe54))
* **rup:** handler obra social ([#2002](https://github.com/andes/app/issues/2002)) ([f03a78a](https://github.com/andes/app/commit/f03a78adb2b3a58ca75ee30c7d0a93288c594c8e))
* **top:** fix en eliminar adjunto ([#1989](https://github.com/andes/app/issues/1989)) ([5e019c0](https://github.com/andes/app/commit/5e019c02f44f161a66a953a003bbdf1b5e7dba3d))
* **top:** guarda organizacion al iniciar prestacion ([#1990](https://github.com/andes/app/issues/1990)) ([a763d16](https://github.com/andes/app/commit/a763d16baa2355ee70bcaaa99304c68f2d486779))
* **turnos-prestaciones:** bug conceptId ([#2006](https://github.com/andes/app/issues/2006)) ([8835db9](https://github.com/andes/app/commit/8835db967cfa57e8cf08817a0ecfb64eb3de6fa5))


### Features

* **buscador:** ordenar asc/desc columnas ([#2000](https://github.com/andes/app/issues/2000)) ([e12548a](https://github.com/andes/app/commit/e12548a0d3b5b5499d7520efe2fbeb986018b159))
* **citas:** incluye createdBy en detalle de agenda ([#1996](https://github.com/andes/app/issues/1996)) ([245d251](https://github.com/andes/app/commit/245d2511f2c6d84d9f9af1c7f7f46a993acf0c20))
* **com:** guardar obra social del paciente ([#2001](https://github.com/andes/app/issues/2001)) ([3824722](https://github.com/andes/app/commit/38247227c061617411f4f318092898fd57d5b881))
* **com:** seleccionar por defecto el profesional logueado ([#1986](https://github.com/andes/app/issues/1986)) ([134a1b3](https://github.com/andes/app/commit/134a1b3afdac6482364652d505aa86205054d4ce))
* **com:** uso de componente paciente-detalle ([#2016](https://github.com/andes/app/issues/2016)) ([61e16cf](https://github.com/andes/app/commit/61e16cfa362f81c3df7bb10741c2cb2aa6c61f7b))
* **mapa-camas:** adapta los estilos de egreso e ingreso de paciente ([#1977](https://github.com/andes/app/issues/1977)) ([e7f8526](https://github.com/andes/app/commit/e7f852632513ffa0e00013456852d19514915719))
* **mapa-camas:** invalida prestacion al deshacer internacion ([#2009](https://github.com/andes/app/issues/2009)) ([3191be8](https://github.com/andes/app/commit/3191be8c0492a6381a79cd6c3d02cad30721fb43))
* **mapa-camas:** trackId en prestaciones ([#2010](https://github.com/andes/app/issues/2010)) ([e3950b3](https://github.com/andes/app/commit/e3950b37b774c073e2c5355934c1580a42d0b7a7))
* **MPI:** agrega funcionalidad a pipe edad ([#1981](https://github.com/andes/app/issues/1981)) ([7ce8932](https://github.com/andes/app/commit/7ce89325215f874d38c52665c9270cebb21a2582))
* **rup:** pacientes agregados a prestacion no nominalizada ([#1965](https://github.com/andes/app/issues/1965)) ([137d3bf](https://github.com/andes/app/commit/137d3bfe73d16d7f4af8c8ab56d8b859531afc24))
* **solicitudes:** agrega nuevo pipe para unificar controles en los botones de las operaciones ([#1995](https://github.com/andes/app/issues/1995)) ([da9220a](https://github.com/andes/app/commit/da9220a06d29966b4a478e1946e4f86faa380378))
* **TOP:** permite anular solicitudes en estado auditoria ([#2014](https://github.com/andes/app/issues/2014)) ([ba51470](https://github.com/andes/app/commit/ba5147077ab4a74221855b518aa2453fbc8c261c))

# [5.19.0](https://github.com/andes/app/compare/v5.18.0...v5.19.0) (2020-10-28)


### Bug Fixes

* **citas:** revision de agenda dinámicas ([#1980](https://github.com/andes/app/issues/1980)) ([a5c445a](https://github.com/andes/app/commit/a5c445a44c6548dd5dc4e629ff490ebeb5483469))
* **inicio:** soporte para links externos ([#1983](https://github.com/andes/app/issues/1983)) ([f484754](https://github.com/andes/app/commit/f484754c0800578e38db5f8fab88f997df940297))
* **mapa-cama:** control desocupada ([5ef650b](https://github.com/andes/app/commit/5ef650b71959264f92cc63e2f1f55465f93b0b4b))
* **menu:** se evitan items repetidos ([#1979](https://github.com/andes/app/issues/1979)) ([d604ed4](https://github.com/andes/app/commit/d604ed47935b8ddccea9b0a9272dd4864b7c69ad))
* **mpi:** setea fecha de fallecimiento ([#1988](https://github.com/andes/app/issues/1988)) ([816578a](https://github.com/andes/app/commit/816578a6bf0738d7d8605ee00fd66f67f75dbe80))
* **top:** arreglo de dropdown en estado asignada ([#1992](https://github.com/andes/app/issues/1992)) ([5d385e4](https://github.com/andes/app/commit/5d385e4ee07446223828fb034baaccbbaafa08c2))


### Features

* **core:** logging de errores de angular ([#1964](https://github.com/andes/app/issues/1964)) ([efafb5e](https://github.com/andes/app/commit/efafb5e2c0d7e85a60dd82815731fd80de304b4d))
* **rup:** anular prestación ([#1928](https://github.com/andes/app/issues/1928)) ([f60ea4d](https://github.com/andes/app/commit/f60ea4dae4541700144f20ca60e47bb805b33eef))

# [5.18.0](https://github.com/andes/app/compare/v5.17.0...v5.18.0) (2020-10-21)


### Bug Fixes

* **com:** limpiar sidebars al cambiar de derivacion ([#1953](https://github.com/andes/app/issues/1953)) ([4f0da19](https://github.com/andes/app/commit/4f0da19efe684646a068ef02863ee52686cb464c))
* **com:** permitir al com cancelar sus derivaciones solicitadas ([#1955](https://github.com/andes/app/issues/1955)) ([4f750f8](https://github.com/andes/app/commit/4f750f87158350c382611bf43aafea2c17760777))
* **GDU:** ExpressionChangedAfterItHasBeenCheckedError perfiles ([#1948](https://github.com/andes/app/issues/1948)) ([62c2b06](https://github.com/andes/app/commit/62c2b06691ef686fec506283c8bdcea91e4cdb4c))
* **mapa-camas:** handle null al borrar sector ([#1974](https://github.com/andes/app/issues/1974)) ([2390ee8](https://github.com/andes/app/commit/2390ee831c66ae2ae48504855fe259096a57e4ed))
* **rup:** solicitudes pierde el formato ([#1957](https://github.com/andes/app/issues/1957)) ([f7129e3](https://github.com/andes/app/commit/f7129e30f432a9f1a838d0be239b895294c59737))


### Features

* **CITAS:** Habilita turnos de gestion en agendas del dia ([#1932](https://github.com/andes/app/issues/1932)) ([4c6dc5a](https://github.com/andes/app/commit/4c6dc5a1d9cc3649cd878284f991dfb37dc97bdd))
* **com:** marcar derivación seleccionada en plex-list ([#1975](https://github.com/andes/app/issues/1975)) ([981daa8](https://github.com/andes/app/commit/981daa848ac3ffd46e9d22099db5e6e134b24ba9))
* **com:** se suma fecha de creación/actualización a listado derivaciones ([#1959](https://github.com/andes/app/issues/1959)) ([1af2284](https://github.com/andes/app/commit/1af228401a074a9552b30e7b45562d3f6028d917))
* **mapa-camas:** agrega sector completo al abm de sala común ([#1963](https://github.com/andes/app/issues/1963)) ([43f3e07](https://github.com/andes/app/commit/43f3e074297270c8d89f792bea8294c857ec913b))
* **mapa-camas:** columnas dinamicas ([#1949](https://github.com/andes/app/issues/1949)) ([a0b9dce](https://github.com/andes/app/commit/a0b9dce73a30ec95570d36b93bda26dae614c41f))
* **mapa-camas:** componente de inconsistencias de camas ([#1746](https://github.com/andes/app/issues/1746)) ([a2232e3](https://github.com/andes/app/commit/a2232e3fee37d8e71ea714eab8eeb40238062248))
* **mapa-camas:** control historial de cama al egresar ([#1880](https://github.com/andes/app/issues/1880)) ([7b6c74e](https://github.com/andes/app/commit/7b6c74eed992f476a480e13e87a6fe008a948c42))
* **mapa-camas:** deshacer internación  ([#1945](https://github.com/andes/app/issues/1945)) ([67ea6a4](https://github.com/andes/app/commit/67ea6a44dfad887be4c2892a121e4b592fe967df))


### Performance Improvements

* **huds:** quita sort inecesario ([#1952](https://github.com/andes/app/issues/1952)) ([55ae989](https://github.com/andes/app/commit/55ae9891c1ba5752ffafe2e3e91116be05c0d0d7))
* **top:** evita calcular estado todo el tiempo ([#1962](https://github.com/andes/app/issues/1962)) ([3b358ae](https://github.com/andes/app/commit/3b358ae9894a4c21588c65495e785de58e739635))

# [5.17.0](https://github.com/andes/app/compare/v5.16.0...v5.17.0) (2020-10-14)


### Bug Fixes

* **COM:** Se modifican los filtros que habían quedado con los enumerados anteriores ([#1947](https://github.com/andes/app/issues/1947)) ([5f7b48a](https://github.com/andes/app/commit/5f7b48a2574ba3c11b872d197b1bdd3f160de164))
* **huds:** cache es un observable ahora ([67d50fb](https://github.com/andes/app/commit/67d50fbf14abd893f168fe79cd4ddab0756a8338))


### Features

* **citas:** lazy load de historial ([#1855](https://github.com/andes/app/issues/1855)) ([797781c](https://github.com/andes/app/commit/797781cc83815d88e0b234f29c2fdc68949bddc3))
* **citas:** mejora interactividad al editar agendas ([#1935](https://github.com/andes/app/issues/1935)) ([2adca7c](https://github.com/andes/app/commit/2adca7ca2f6df918dd3ff15353f133d57db6b442))
* **gestor-usuario:** permisos unidad organizativa  ([#1914](https://github.com/andes/app/issues/1914)) ([ff4b7c3](https://github.com/andes/app/commit/ff4b7c3f95040352e02f56afc09bbe939bf0266c))
* **mapa-camas:** sala común ([#1924](https://github.com/andes/app/issues/1924)) ([978f79f](https://github.com/andes/app/commit/978f79f4a2da5b1edb0daca0617a33474b7aea14))
* **rup:** crear solicitudes en background ([#1942](https://github.com/andes/app/issues/1942)) ([d8e8171](https://github.com/andes/app/commit/d8e81718054771809dc8745ad910e97e65bb3133))

# [5.16.0](https://github.com/andes/app/compare/v5.15.0...v5.16.0) (2020-10-07)


### Bug Fixes

* **citas:** error obra social al autocitar ([#1930](https://github.com/andes/app/issues/1930)) ([f06ab27](https://github.com/andes/app/commit/f06ab27485e79dae1d3950b68b14ece12993e60f))
* **rup:** ejecutar una solicitud ([#1931](https://github.com/andes/app/issues/1931)) ([00ddba6](https://github.com/andes/app/commit/00ddba6ed7692b471b6fd83bf915e331ba822b18))


### Features

* **com:** cambio de nombre de estado pendiente por solicitada ([#1941](https://github.com/andes/app/issues/1941)) ([d9cfbb7](https://github.com/andes/app/commit/d9cfbb7a642df31b6f7f2b8f3671adc5f474ad5a))
* **com:** permitir sumar notas/adjuntos a estado actual ([#1940](https://github.com/andes/app/issues/1940)) ([d9c4a0f](https://github.com/andes/app/commit/d9c4a0fd2f3c4bee23dfd11dbd953afe4c3735e7))
* **com:** redirigir a inicio si no tiene permisos ([#1937](https://github.com/andes/app/issues/1937)) ([3d948ed](https://github.com/andes/app/commit/3d948ed67131aa5ab9cd5641fa94f254efe7212e))
* **core:** mejoras de performance  ([#1923](https://github.com/andes/app/issues/1923)) ([8755c26](https://github.com/andes/app/commit/8755c26b17cde8962f221a35dec398c199ec1a50))
* **mapa-camas:** agrega sector completo al alta de cama ([#1934](https://github.com/andes/app/issues/1934)) ([57bd535](https://github.com/andes/app/commit/57bd535862697599e273230ac630447b9d0152ca))
* **mapa-camas:** controla el permiso de bloqueo de camas ([#1929](https://github.com/andes/app/issues/1929)) ([5594fc0](https://github.com/andes/app/commit/5594fc08b5958bdf7268fa5b1f853fdca0b81c8a))
* **rup:** filtros por semanticTag a SelectSnomedComponent ([#1899](https://github.com/andes/app/issues/1899)) ([67a7dfa](https://github.com/andes/app/commit/67a7dfabdf498fe4f1f4681458b09fcdc043fe35))
* **rup:** molecula-base búsqueda de ultimo registro ([#1883](https://github.com/andes/app/issues/1883)) ([f8bd11c](https://github.com/andes/app/commit/f8bd11c1997cb039de7a9930ba2754eb7545d9c7))
* **rup:** parámetro registrar conceptos repetidos en una prestación  ([#1895](https://github.com/andes/app/issues/1895)) ([e051e2e](https://github.com/andes/app/commit/e051e2e047be7637f4b5ef995fcc6d7efdfda502))
* **tm:** configurar aceptaDerivacion en organizaciones ([#1936](https://github.com/andes/app/issues/1936)) ([a06d80e](https://github.com/andes/app/commit/a06d80e47b72bb2b30c424ddac7284d5d6d7379b))

# [5.15.0](https://github.com/andes/app/compare/v5.14.0...v5.15.0) (2020-09-30)


### Bug Fixes

* **citas:** Corrige consulta repetitiva a api ([#1915](https://github.com/andes/app/issues/1915)) ([a40a233](https://github.com/andes/app/commit/a40a233fe2b53d22234999462dcb818182ebb83d))
* **huds:** error al visualizar prestaciones de un paciente inicialmente ([#1918](https://github.com/andes/app/issues/1918)) ([11fc741](https://github.com/andes/app/commit/11fc741b9fcc5cfaa60ef75a5df92b50168e1d41))


### Features

* **core:** check timezone ([#1925](https://github.com/andes/app/issues/1925)) ([f178ae0](https://github.com/andes/app/commit/f178ae0647f18e2d92b36543878d7486bf73c4d2))
* **mapa-camas:** saca "otros" de razon de alta y motivo de bloqueo ([#1835](https://github.com/andes/app/issues/1835)) ([2ab630b](https://github.com/andes/app/commit/2ab630b0fbdc22cd115cd9e5cf2f14de41ab3c4b))
* **mapa-camas:** virtual scroll en tabla de camas ([#1710](https://github.com/andes/app/issues/1710)) ([623650b](https://github.com/andes/app/commit/623650b8e6c6a913a7483bad62741f97f3c54828))
* **rup:** flujo de datos al ejecutar un concepto ([#1900](https://github.com/andes/app/issues/1900)) ([245d163](https://github.com/andes/app/commit/245d1636f35ef02b6b0698790c58617d9d8f5099))

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
