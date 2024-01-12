
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Auth } from '@andes/auth';
import { cache, Server } from '@andes/shared';
import { IPrestacion } from '../interfaces/prestacion.interface';
import { IPrestacionGetParams } from '../interfaces/prestacionGetParams.interface';
import { SnomedService } from '../../../apps/mitos';
import { HUDSService } from '../services/huds.service';
import { Plex } from '@andes/plex';
import { populateRelaciones } from '../operators/populate-relaciones';
import { AdjuntosService } from './adjuntos.service';
import { environment } from 'src/environments/environment';
import { ITurno } from 'src/app/interfaces/turnos/ITurno';
import { Router } from '@angular/router';
import { IPacienteBasico } from 'src/app/core/mpi/interfaces/IPaciente';


@Injectable()
export class PrestacionesService {
    public static InformeDelEncuentro = '371531000';

    public static SemanticTags = {
        hallazgo: ['hallazgo', 'situación', 'evento'],
        trastorno: ['trastorno'],
        procedimiento: ['procedimiento', 'entidad observable', 'régimen/tratamiento'],
        plan: ['procedimiento', 'régimen/tratamiento'],
        producto: ['producto', 'objeto físico', 'medicamento clínico', 'fármaco de uso clínico'],
        elementoderegistro: ['elemento de registro']
    };

    public static InternacionPrestacion = {
        fsn: 'admisión hospitalaria (procedimiento)',
        semanticTag: 'procedimiento',
        conceptId: '32485007',
        term: 'internación'
    };

    private prestacionesUrl = '/modules/rup/prestaciones'; // URL to web api
    private cache: any[] = [];
    private cachePrimeraBusqueda = [];
    // ---TODO----- Ver en que servicio dejar esta funcionalidad
    public destinoRuta = new BehaviorSubject<boolean>(false);
    public rutaVolver = this.destinoRuta.asObservable();


    /**
     * [TODO] cambiar nombres
     * Se usa solo para le odontograma.
     */

    private datosRefSet = new BehaviorSubject<any>(null);

    public restriccion = this.auth.check('huds:soloEfectorActual');

    setRefSetData(datos: IPrestacion[], refsetId?) {
        this.datosRefSet.next({ conceptos: datos, refsetId: refsetId });
    }

    getRefSet() {
        return this.datosRefSet.asObservable();
    }

    getRefSetData(): any {
        return this.datosRefSet.getValue();
    }

    clearRefSetData() {
        this.datosRefSet.next(null);
    }

    constructor(
        private server: Server,
        private auth: Auth,
        private snomed: SnomedService,
        private hudsService: HUDSService,
        private plex: Plex,
        private archivoAdjuntoService: AdjuntosService,
        private router: Router
    ) {
    }

    /**
     * Le pasamos por parametro un objeto con el nombre y la ruta
     * De la pantalla asi seteamos el boton de volver en el ejecucion
     * @param ruteo
     */
    public notificaRuta(ruteo) {
        this.destinoRuta.next(ruteo);
    }


    /**
     * Método get. Trae lista de objetos solicitudes.
     *
     * @param {*} params Opciones de búsqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    getSolicitudes(params: any): Observable<IPrestacion[]> {
        return this.server.get(this.prestacionesUrl + '/solicitudes', { params: params, showError: true });
    }


    getServicioIntermedios(params: any): Observable<IPrestacion[]> {
        return this.server.get(this.prestacionesUrl + '/servicio-intermedio', { params: params, showError: true });
    }

    /**
     * Método get. Trae lista de objetos prestacion.
     *
     * @param {*} params: IPrestacioGetParams Opciones de búsqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    get(params: IPrestacionGetParams, options: any = {}): Observable<IPrestacion[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        if (params.idPaciente) {
            params['hudsToken'] = this.hudsService.getHudsToken();
        }

        const opt = { params: params, options };

        return this.server.get(this.prestacionesUrl, opt);
    }

    /**
     * Método getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String, options: any = {}): Observable<IPrestacion> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        const url = this.prestacionesUrl + '/' + id;
        return this.server.get(url, options);
    }

    /**
     * Método getByPaciente. Busca todas las prestaciones de un paciente
     * @param {String} idPaciente
     */
    getByPaciente(idPaciente: any, recargarCache: boolean = false): Observable<any[]> {
        const copiaCacheAnterior = Object.assign({}, this.cachePrimeraBusqueda);
        this.cachePrimeraBusqueda[idPaciente] = {
            idPaciente,
            idOrg: this.auth.organizacion.id,
            restriccion: this.restriccion
        };
        // Verificamos si se busca el mismo paciente en otra organizacion y si tiene restriccion para tener que volver a cargar los datos.
        if (!recargarCache && (copiaCacheAnterior[idPaciente]?.idOrg === this.cachePrimeraBusqueda[idPaciente]?.idOrg || (copiaCacheAnterior[idPaciente] && !copiaCacheAnterior[idPaciente]?.restriccion && !this.cachePrimeraBusqueda[idPaciente]?.restriccion))) {
            return this.cache[idPaciente];
        } else {
            const opt = {
                params: {
                    idPaciente: idPaciente,
                    sinEstado: ['modificada', 'anulada'],
                    hudsToken: this.hudsService.getHudsToken()
                },
                options: {
                    showError: true
                }
            };
            // En caso de tener que buscar los datos nos fijamos si tiene restriccion por efector.
            if (this.restriccion) {
                opt.params['efectorRestringido'] = this.auth.organizacion.id;
            };
            this.cache[idPaciente] = this.server.get(this.prestacionesUrl, opt).pipe(
                map(prestaciones => {
                    prestaciones.forEach(p => populateRelaciones(p));
                    return prestaciones;
                }),
                cache()
            );
            return this.cache[idPaciente];
        }

    }

    /**
     * Método getByPacienteKey
     * @param {String} idPaciente
     */
    getRegistroById(idPaciente: any, id: any): Observable<any[]> {
        return this.getByPaciente(idPaciente).pipe(map(prestaciones => {
            let registros = [];

            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    registros = [...registros, ...prestacion.ejecucion.registros];

                }
            });
            return registros.find(r => r.id === id);

        }));
    }

    private _cacheRegistros = {};
    clearConceptosPaciente(idPaciente) {
        this._cacheRegistros[idPaciente] = null;
    }

    getConceptosByPaciente(idPaciente: string, soloValidados?: boolean): Observable<any[]> {

        if (this._cacheRegistros[idPaciente]) {
            return new Observable(observe => observe.next(this._cacheRegistros[idPaciente]));
        } else {
            return this.getByPaciente(idPaciente).pipe(map(prestaciones => {
                let registros = [];
                if (soloValidados) {
                    prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
                }
                prestaciones.forEach((prestacion: any) => {

                    prestacion.ejecucion.registros.forEach(registro => {
                        if (registro.hasSections) { // COLONO O EPICRISIS
                            registro.registros.forEach(seccion => {
                                if (seccion.isSection && !seccion.noIndex) {
                                    prestacion.ejecucion.registros = [...prestacion.ejecucion.registros, ...seccion.registros];
                                }
                            });
                        }
                    });


                    if (prestacion.ejecucion) {
                        const conceptos = prestacion.ejecucion.registros
                            // .filter(registro => semanticTags.includes(registro.concepto.semanticTag))
                            .map(registro => {
                                registro.idPrestacion = prestacion.id;
                                registro.tipoPrestacion = prestacion.solicitud.tipoPrestacion.term;
                                return registro;
                            });
                        // ConceptId del informe requerido en en todas las prestaciones ambulatorias
                        if (conceptos.length > 0) {
                            conceptos[0].informeRequerido = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === PrestacionesService.InformeDelEncuentro);
                        }
                        registros = [...registros, ...conceptos];
                    }
                });
                registros = registros.sort((a, b) => a.createdAt - b.createdAt);

                let registroSalida = [];
                registros.forEach(registro => {
                    const registroEncontrado = registroSalida.find(reg => {
                        if (reg.concepto.conceptId === registro.concepto.conceptId) {
                            if (reg.evoluciones.find(e => registro.valor && e.idRegistro === registro.valor.idRegistroOrigen)) {
                                return reg;
                            }
                        }
                    });
                    const prestacion = prestaciones.find(p => p.id === registro.idPrestacion);
                    if (!registroEncontrado) {
                        const dato = {
                            tipoPrestacion: registro.tipoPrestacion,
                            idPrestacion: registro.idPrestacion,
                            idRegistro: registro.id,
                            fechaEjecucion: prestacion.ejecucion.fecha,
                            concepto: registro.concepto,
                            prestaciones: [registro.idPrestacion],
                            esSolicitud: registro.esSolicitud,
                            elementoRUP: registro.elementoRUP,
                            evoluciones: [{
                                tipoPrestacion: registro.tipoPrestacion,
                                idPrestacion: registro.idPrestacion,
                                idRegistro: registro.id,
                                fechaCarga: prestacion.ejecucion.fecha,
                                profesional: registro.createdBy.nombreCompleto,
                                organizacion: prestacion.solicitud.organizacion.nombre,
                                fechaInicio: registro.valor && registro.valor.fechaInicio ? registro.valor.fechaInicio : null,
                                estado: registro.valor && registro.valor.estado ? registro.valor.estado : '',
                                evolucion: registro.valor && registro.valor.evolucion ? registro.valor.evolucion : '',
                                idRegistroOrigen: registro.valor && registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : null,
                                informeRequerido: registro.informeRequerido ? registro.informeRequerido : null,
                                relacionadoCon: (registro.relacionadoCon ? registro.relacionadoCon : []).map(r => {
                                    r.fechaCarga = prestacion.ejecucion.fecha; return r;
                                }),
                                valor: registro.valor
                            }],
                            registros: [registro],
                            privacy: (registro.privacy && registro.privacy.scope) ? registro.privacy.scope : 'public'
                        };
                        registroSalida.push(dato);
                    } else {
                        const ultimaEvolucion = registroEncontrado.evoluciones[registroEncontrado.evoluciones.length - 1];
                        const nuevaEvolucion = {
                            tipoPrestacion: registro.tipoPrestacion,
                            idPrestacion: registro.idPrestacion,
                            fechaCarga: prestacion.ejecucion.fecha,
                            idRegistro: registro.id,
                            profesional: registro.createdBy.nombreCompleto,
                            organizacion: prestacion.solicitud.organizacion.nombre,
                            fechaInicio: registro.valor && registro.valor.fechaInicio ? registro.valor.fechaInicio : ultimaEvolucion.fechaInicio,
                            estado: registro.valor && registro.valor.estado ? registro.valor.estado : ultimaEvolucion.estado,
                            evolucion: registro.valor && registro.valor.evolucion ? registro.valor.evolucion : '',
                            idRegistroOrigen: registro.valor && registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : ultimaEvolucion.idRegistroOrigen,
                            informeRequerido: registro.informeRequerido ? registro.informeRequerido : null,
                            relacionadoCon: (registro.relacionadoCon ? registro.relacionadoCon : []).map(r => {
                                r.fechaCarga = prestacion.ejecucion.fecha; return r;
                            }),
                            valor: registro.valor
                        };
                        registroEncontrado.prestaciones.push(registro.idPrestacion);
                        registroEncontrado.evoluciones.push(nuevaEvolucion);
                        registroEncontrado.registros.push(registro);
                        // ordenamos las evoluciones para que la primero del array sea la ultima registrada
                        registroEncontrado.evoluciones = registroEncontrado.evoluciones.sort((a, b) => b.fechaCarga - a.fechaCarga);
                        registroEncontrado.privacy = (registro.privacy && registro.privacy.scope) ? registro.privacy.scope : 'public';
                    }
                });
                registroSalida = registroSalida.sort((a, b) => {
                    return b.evoluciones[0].fechaCarga - a.evoluciones[0].fechaCarga;
                });
                this._cacheRegistros[idPaciente] = registroSalida;
                return registroSalida;
            }));
        }
    }

    /**
     * Método getByPacienteHallazgo lista todo los hallazgos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteHallazgo(idPaciente: any): Observable<any[]> {
        return this.getConceptosByPaciente(idPaciente, true).pipe(map(r => r.filter(reg => PrestacionesService.SemanticTags.hallazgo.find(e => e === reg.concepto.semanticTag))));
    }

    getByPacienteTrastorno(idPaciente: any): Observable<any[]> {
        return this.getConceptosByPaciente(idPaciente, true).pipe(map(r => r.filter(reg => PrestacionesService.SemanticTags.trastorno.find(e => e === reg.concepto.semanticTag))));
    }

    getByPacienteProcedimiento(idPaciente: any) {
        return this.getConceptosByPaciente(idPaciente, true).pipe(map(r => r.filter(reg => PrestacionesService.SemanticTags.procedimiento.find(e => e === reg.concepto.semanticTag && !reg.esSolicitud))));
    }

    getByPacienteElementoRegistros(idPaciente: any) {
        return this.getConceptosByPaciente(idPaciente, true).pipe(map(r => r.filter(reg => PrestacionesService.SemanticTags.elementoderegistro.find(e => e === reg.concepto.semanticTag))));
    }

    /**
     * Método getByPacienteSolicitud lista todas las solicitudes registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteSolicitud(idPaciente: any) {
        return this.getConceptosByPaciente(idPaciente, true).pipe(map(r => r.filter((reg) => PrestacionesService.SemanticTags.procedimiento.find(e => e === reg.concepto.semanticTag && reg.esSolicitud))));
    }

    /**
     * Método getByPacienteMedicamento lista todos los medicamentos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteMedicamento(idPaciente: any): Observable<any[]> {
        return this.getConceptosByPaciente(idPaciente, true).pipe(map(r => r.filter((reg) => PrestacionesService.SemanticTags.producto.find(e => e === reg.concepto.semanticTag))));
    }

    getCDAByPaciente(idPaciente, token, conceptId = null) {
        const opt: any = {
            params: {
                hudsToken: token
            }
        };
        if (conceptId) {
            opt.params.prestacion = { prestacion: conceptId };
        }
        if (this.restriccion) {
            opt.params.org = this.auth.organizacion.id;
        }
        return this.server.get(`/modules/cda/paciente/${idPaciente}`, opt);
    }


    /**
     * Método getUnHallazgoPaciente x Concepto obtiene un hallazgo cronico o activo con todas sus evoluciones
     * para un paciente
     * @param {String} idPaciente
     */
    getUnTrastornoPaciente(idPaciente: any, concepto: any): Observable<any> {
        return this.getByPacienteTrastorno(idPaciente).pipe(map(hallazgos => {
            return hallazgos.find(registro => {
                if ((registro.concepto.conceptId === concepto.conceptId) && (registro.evoluciones[0].esCronico || registro.evoluciones[0].estado === 'activo')) {
                    return registro;
                }
            });
        }));
    }

    /**
     * Método getUnHallazgoPacienteXOrigen obtiene un hallazgo con todas sus evoluciones
     * para un paciente buscandolo por el registro de origen
     * @param {String} idPaciente
     * @param {String} idRegistroOrigen
     */
    getUnHallazgoPacienteXOrigen(idPaciente: any, idRegistroOrigen: any): Observable<any> {
        return this.getByPacienteTrastorno(idPaciente).pipe(map(trastornos =>
            trastornos.find(registro => {
                if (registro.evoluciones.find(e => e.idRegistro === idRegistroOrigen)) {
                    return registro;
                }
            })
        ));
    }


    /**
         * Método getUnMedicamentoXOrigen obtiene un registro de medicamento con todas sus evoluciones
         * para un paciente buscandolo por el registro de origen
         * @param {String} idPaciente
         * @param {String} idRegistroOrigen
         */
    getUnMedicamentoXOrigen(idPaciente: any, idRegistroOrigen: any): Observable<any> {
        return this.getByPacienteMedicamento(idPaciente).pipe(map(registrosMed =>
            registrosMed.find(registro => {
                if (registro.evoluciones.find(e => e.idRegistro === idRegistroOrigen)) {
                    return registro;
                }
            })
        ));
    }

    /**
     * Buscar en la HUDS de un paciente los registros que coincidan con los conceptIds
     *
     * @param {string} idPaciente Paciente a buscar
     * @param {any[]} expresion expresion SNOMED que obtiene los conceptos que deseo buscar
     * @returns {any[]} Prestaciones del paciente que coincidan con los conceptIds
     * @memberof PrestacionesService
     */
    getRegistrosHuds(idPaciente: string, expresion, deadLine = null, valor = null, searchTerm = null, form = null) {
        const opt = {
            params: {
                valor,
                expresion,
                searchTerm,
                form,
                deadLine,
                hudsToken: this.hudsService.getHudsToken()
            },
            options: {
                // showError: true
            }
        };

        return this.server.get(this.prestacionesUrl + '/huds/' + idPaciente, opt);
    }


    /**
        * Método que retorna todas las epicrisis
        * por paciente
        * @param {String} idPaciente
        * @param conceptId
        */
    getPrestacionesXtipo(idPaciente: any, conceptIds: string[] | string): Observable<any[]> {
        const conceptos = Array.isArray(conceptIds) ? conceptIds : [conceptIds];
        return this.getByPaciente(idPaciente).pipe(
            map(prestaciones => {
                const prestacionesXtipo = prestaciones.filter(prestacion => {
                    return conceptos.find(id => prestacion.solicitud.tipoPrestacion.conceptId === id);
                });
                return prestacionesXtipo;
            })
        );
    }



    /**
     * Método post. Inserta un objeto nuevo.
     * @param {any} prestacion Recibe solicitud RUP con paciente
     */
    post(prestacion: any): Observable<any> {
        return this.server.post(this.prestacionesUrl, prestacion);
    }

    /**
     * Método put. Actualiza un objeto prestacionPaciente.
     * @param {IPrestacionPaciente} problema Recibe IPrestacionPaciente
     */
    put(prestacion: IPrestacion): Observable<IPrestacion> {
        return this.server.put(this.prestacionesUrl + '/' + prestacion.id, prestacion);
    }

    patch(idPrestacion: string, cambios: any): Observable<IPrestacion> {
        return this.server.patch(this.prestacionesUrl + '/' + idPrestacion, cambios);
    }

    /**
     * Inicializar una prestación con algunos datos obligatorios
     *
     * @param {*} paciente Objeto con la info del paciente
     * @param {*} snomedConcept Objeto con la info del concepto SNOMED
     * @param {String} [momento='solicitud'] Momento en el cual estoy creando la prestacion (solicitud / ejecucion / validacion)
     * @param {*} [fecha=new Date()] Fecha a almacenar en el momento
     * @param {*} [turno=null] Objeto turno
     * @returns {*} Prestacion
     * @memberof PrestacionesService
     */
    inicializarPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', ambitoOrigen = 'ambulatorio', fecha: Date = new Date(), turno: any = null, _profesional: any = null, registrosEjecucion = []): IPrestacion {
        let pacientePrestacion: IPacienteBasico;
        if (!paciente) {
            pacientePrestacion = undefined;
        } else {
            pacientePrestacion = {
                id: paciente.id,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                alias: paciente.alias,
                numeroIdentificacion: paciente.numeroIdentificacion,
                genero: paciente.genero,
                documento: paciente.documento,
                sexo: paciente.sexo,
                fechaNacimiento: paciente.fechaNacimiento
            };
            if (paciente.obraSocial) {
                pacientePrestacion.obraSocial = paciente.obraSocial;
            }
        }
        const prestacion = {
            paciente: pacientePrestacion
        };

        if (momento === 'solicitud') {
            prestacion['solicitud'] = {
                fecha: fecha,
                turno: turno,
                tipoPrestacion: snomedConcept,
                // profesional logueado
                profesional: {
                    id: this.auth.profesional,
                    nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido,
                    documento: this.auth.usuario.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                registros: []
            };

            prestacion['estados'] = [{
                fecha: fecha,
                tipo: 'ejecucion'
            }];

        } else if (momento === 'ejecucion') {
            let profesional;
            // Si el profesional llega por parametro.
            if (_profesional) {
                profesional = {
                    id: _profesional.id,
                    nombre: _profesional.nombre,
                    apellido: _profesional.apellido,
                    documento: _profesional.documento
                };
            } else {
                profesional = {
                    id: this.auth.profesional,
                    nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido,
                    documento: this.auth.usuario.documento
                };
            }
            prestacion['solicitud'] = {
                fecha: fecha,
                turno: turno,
                tipoPrestacion: snomedConcept,
                // profesional logueado
                profesional:
                {
                    id: profesional.id, nombre: profesional.nombre,
                    apellido: profesional.apellido, documento: profesional.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                registros: []
            };

            prestacion['ejecucion'] = {
                fecha: fecha,
                registros: registrosEjecucion,
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            };

            prestacion['estados'] = [{
                fecha: fecha,
                tipo: 'ejecucion'
            }];
        } else if (momento === 'validacion') {
            prestacion['solicitud'] = {
                fecha: fecha,
                turno: turno,
                tipoPrestacion: snomedConcept,
                // profesional logueado
                profesional:
                {
                    id: this.auth.profesional,
                    nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido,
                    documento: this.auth.usuario.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                registros: []
            };

            prestacion['estados'] = [{
                fecha: fecha,
                tipo: 'pendiente'
            }];
        }
        if (paciente) {
            prestacion.paciente['_id'] = paciente.id;
            prestacion['solicitud'].ambitoOrigen = ambitoOrigen;
        }
        if (snomedConcept.esMultiprestacion) {
            prestacion['groupId'] = turno;
        }

        return prestacion as IPrestacion;
    }

    crearPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', fecha: any = new Date(), turno: any = null): Observable<any> {
        const prestacion = this.inicializarPrestacion(paciente, snomedConcept, momento, 'ambulatorio', fecha, turno);
        return this.post(prestacion);
    }

    validarPrestacion(prestacion): Observable<any> {
        prestacion.ejecucion.registros.forEach(x => {
            if (x.relacionadoCon && x.relacionadoCon.length) {
                x.relacionadoCon.forEach(y => {
                    delete y.relacionadoCon;
                });
            }
        });
        const dto: any = {
            op: 'estadoPush',
            estado: { tipo: 'validada' },
            registros: prestacion.ejecucion.registros,
            registrarFrecuentes: true
        };
        return this.patch(prestacion.id, dto);

    }

    invalidarPrestacion(prestacion): Observable<any> {
        let data;
        if (prestacion.solicitud.turno) {
            data = { op: 'desasociarTurno' };
        } else {
            data = { op: 'estadoPush', estado: { tipo: 'anulada' } };
        }
        return this.patch(prestacion.id, data);
    }


    /**
     * Devuelve un listado de prestaciones planificadas desde una prestación origen
     *
     * @param {any} idPrestacion id de la prestacion origen
     * @param {any} idPaciente id del paciente
     * @param {boolean} recarga forzar la recarga de la prestaciones (ante algún cambio)
     * @returns  {array} listado de prestaciones planificadas en una prestación
     * @memberof BuscadorComponent
     */
    public getPlanes(idPrestacion, idPaciente, recarga = false) {
        return this.getByPaciente(idPaciente, recarga).pipe(
            map(listadoPrestaciones => {
                return listadoPrestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'pendiente' && p.solicitud.prestacionOrigen === idPrestacion);
            })
        );
    }

    /**
     * Devuelve true si se cargo en la prestación algun concepto que representa la ausencia del paciente
     *
     * @param {any} prestacion prestación en ejecución
     * @returns  {boolean}
     * @memberof BuscadorComponent
     */
    public prestacionPacienteAusente(): Observable<any[]> {
        return this.snomed.getQuery({ expression: '<<281399006' });

    }

    /**
    * Devuelve el texto del informe del encuentro asociado al registro
    *
    * @param {any} paciente un paciente
    * @param {any} registro un registro de una prestación
    * @returns  {string} Informe del encuentro relacionado al registro de entrada
    * @memberof PrestacionesService
    */
    mostrarInformeRelacionado(paciente, registro, concepto) {
        if (registro.idPrestacion && concepto.conceptId !== PrestacionesService.InformeDelEncuentro) {
            return this.getByPaciente(paciente.id).pipe(
                map(prestaciones => prestaciones.find(p => p.id === registro.idPrestacion)),
                map((prestacion: any) => {
                    if (prestacion) {
                        // vamos a buscar si en la prestación esta registrado un informe del encuentro
                        const registroEncontrado = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === PrestacionesService.InformeDelEncuentro);
                        if (registroEncontrado) {
                            return registroEncontrado.valor ? '<label>Informe del encuentro</label>' + registroEncontrado.valor : null;
                        }
                    }
                    return '';
                })
            );
        }
        return of('');
    }

    getFriendlyName(registro) {
        let nombre = (registro && registro.concepto && registro.concepto.term) ? registro.concepto.term : '';

        // Odontograma?
        if (registro && registro.cara) {
            nombre = `Diente ${nombre} (${registro.cara !== 'pieza completa' ? registro.cara : `cara ${registro.cara}`})`;
        }

        return nombre;

    }


    romperValidacion(prestacion: IPrestacion) {
        return new Observable((observer) => {
            this.plex.confirm('Esta acción puede traer consecuencias <br />¿Desea continuar?', 'Romper validación').then(validar => {
                if (!validar) {
                    observer.error();
                    observer.complete();
                    return false;
                } else {
                    // hacemos el patch y luego creamos los planes
                    const cambioEstado: any = {
                        op: 'romperValidacion'
                    };

                    // En api el estado de la prestación cambia a ejecucion
                    this.patch(prestacion.id, cambioEstado).subscribe(() => {
                        observer.next();
                        observer.complete();
                    }, (err) => {
                        this.plex.toast('danger', 'ERROR: No es posible romper la validación de la prestación');
                        observer.error();
                        observer.complete();
                    });
                }
            });

        });
    }

    getFechaPrestacionTurnoDinamico(fechaTurno) {
        const esAnterior = moment(fechaTurno).isBefore(new Date(), 'day');
        return esAnterior ? fechaTurno : new Date();
    }

    visualizarImagen(prestacion: IPrestacion) {
        this.archivoAdjuntoService.token$.subscribe(({ token }) => {
            const url = `${environment.API}/modules/rup/prestaciones/${prestacion.id}/pacs?token=${token}`;
            window.open(url, '_blank');
        });
    }



    navegarAEjecucion(prestacion: IPrestacion, turno?: ITurno) {
        const tieneAccesoHUDS = this.auth.check('huds:visualizacionHuds');
        const paciente = prestacion.paciente;
        const snomedConcept = prestacion.solicitud.tipoPrestacion;
        if (tieneAccesoHUDS) {
            const paramsToken = {
                usuario: this.auth.usuario,
                organizacion: this.auth.organizacion,
                paciente: paciente,
                motivo: snomedConcept.term,
                profesional: this.auth.profesional,
                idTurno: turno?.id,
                idPrestacion: prestacion.id
            };
            this.hudsService.generateHudsToken(
                paramsToken
            ).subscribe((husdTokenRes) => {
                if (husdTokenRes.token) {
                    window.sessionStorage.setItem('huds-token', husdTokenRes.token);
                    this.router.navigate(['rup/ejecucion/', prestacion.id]);
                }
            });
        } else {
            this.router.navigate(['rup/ejecucion/', prestacion.id]);
        }
    }


}
