
import { map } from 'rxjs/operators';
import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { IPrestacion } from '../interfaces/prestacion.interface';
import { IPrestacionGetParams } from '../interfaces/prestacionGetParams.interface';
import { IPrestacionRegistro } from '../interfaces/prestacion.registro.interface';
import { SnomedService } from '../../../services/term/snomed.service';



@Injectable()
export class PrestacionesService {

    @Output() notifySelection: EventEmitter<any> = new EventEmitter<any>();

    private prestacionesUrl = '/modules/rup/prestaciones';  // URL to web api
    private cache: any[] = [];
    private cacheRegistros: any[] = [];
    private cacheMedicamentos: any[] = [];
    // ---TODO----- Ver en que servicio dejar esta funcionalidad
    public destinoRuta = new BehaviorSubject<boolean>(false);
    public rutaVolver = this.destinoRuta.asObservable();

    private datosRefSet = new BehaviorSubject<any>(null);
    private concepto = new BehaviorSubject<any>(null);

    public esSolicitud = new BehaviorSubject<boolean>(false);

    setEsSolicitud(esSolicitud) {
        this.esSolicitud.next(esSolicitud);
    }

    getEsSolicitud() {
        return this.esSolicitud.asObservable();
    }

    /**
     * [TODO] cambiar nombres
     * Se usan para las secciones de epicrisis y otros.
     */

    setData(concepto: IPrestacion) {
        this.concepto.next({ concepto });
        this.notifySelection.emit(true);
    }

    getData(): any {
        return this.concepto.getValue();
    }

    clearData() {
        this.concepto.next(null);
    }

    /**
     * [TODO] cambiar nombres
     * RefSetData se usa para notificar el seccionado actual.
     */

    setRefSetData(datos: IPrestacion[], refsetId?) {
        this.datosRefSet.next({ conceptos: datos, refsetId: refsetId });
    }

    getRefSetData(): any {
        return this.datosRefSet.getValue();
    }

    clearRefSetData() {
        this.datosRefSet.next(null);
    }


    public refsetsIds = {
        cronico: '1641000013105',
        // programable: '1661000013109',
        Antecedentes_Familiares: '1621000013103',
        Antecedentes_Personales_procedimientos: '1911000013100',
        Antecedentes_Personales_hallazgos: '1901000013103',
        Antecedentes_Para_Estudios_Otoemision: '2121000013101',
        situacionLaboral: '200000000',
        nivelEstudios: '3'
    };
    public elementosRegistros = {
        odontograma: '3561000013109'
    };

    // Ids de conceptos que refieren que un paciente no concurrió a la consulta
    // Se usan para hacer un PATCH en el turno, quedando turno.asistencia = 'noAsistio'

    public conceptosTurneables: any[];

    constructor(private server: Server, public auth: Auth, private servicioTipoPrestacion: TipoPrestacionService, public snomed: SnomedService) {

        this.servicioTipoPrestacion.get({}).subscribe(conceptosTurneables => {
            this.conceptosTurneables = conceptosTurneables;
        });
    }
    // ------ TODO----- Ver en que servicio dejar esta funcionalidad

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
    getSolicitudes(params: any, options: any = {}): Observable<IPrestacion[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt = { params: params, options };

        return this.server.get(this.prestacionesUrl + '/solicitudes', opt);
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

        let opt = { params: params, options };

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

        let url = this.prestacionesUrl + '/' + id;
        return this.server.get(url, options);
    }

    /**
     * Método getByPaciente. Busca todas las prestaciones de un paciente
     * @param {String} idPaciente
     */
    getByPaciente(idPaciente: any, recargarCache: boolean = false): Observable<any[]> {
        if (this.cache[idPaciente] && !recargarCache) {
            return new Observable(resultado => resultado.next(this.cache[idPaciente]));
        } else {
            let opt;
            opt = {
                params: {
                    'idPaciente': idPaciente,
                    'ordenFecha': true,
                    'sinEstado': 'modificada'
                },
                options: {
                    showError: true
                }
            };
            return this.server.get(this.prestacionesUrl, opt).pipe(map(data => {
                this.cache[idPaciente] = data;
                // Limpiamos la cache de registros por si hubo modificaciones en las prestaciones
                this.cacheRegistros[idPaciente] = null;
                return this.cache[idPaciente];
            }));
        }

    }

    findValues(obj, key) { // funcion para buscar una key y recupera un array con sus valores.
        return this.findValuesHelper(obj, key, []);
    }

    findValuesHelper(obj, key, list) {
        let i;
        let children;
        if (!obj) {
            return list;
        }
        if (obj instanceof Array) {
            for (i in obj) {
                if (obj[i]) {
                    list = list.concat(this.findValuesHelper(obj[i], key, []));
                }
            }
            return list;
        }
        if (obj[key]) {
            list.push(obj[key]);
        }

        if ((typeof obj === 'object') && (obj !== null)) {
            children = Object.keys(obj);
            if (children.length > 0) {
                for (i = 0; i < children.length; i++) {
                    list = list.concat(this.findValuesHelper(obj[children[i]], key, []));
                }
            }
        }
        return list;
    }


    /**
     * Método getByPacienteKey
     * @param {String} idPaciente
     */
    getByPacienteKey(idPaciente: any, key: any): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
            let registros: IPrestacionRegistro[] = [];

            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    registros = [...registros, ...prestacion.ejecucion.registros];

                }
            });
            let registroEncontrado = this.findValues(registros, key);
            if (registroEncontrado && registroEncontrado.length > 0) {
                return registroEncontrado[0];
            }
            return null;
        });
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

    /**
     * Método getByPacienteHallazgo lista todo los hallazgos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteHallazgo(idPaciente: any, soloValidados?: boolean): Observable<any[]> {
        return this.getByPaciente(idPaciente).pipe(map(prestaciones => {
            let registros = [];
            if (soloValidados) {
                prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            }
            prestaciones.forEach((prestacion: any) => {
                if (prestacion.ejecucion) {
                    let agregar = prestacion.ejecucion.registros
                        .filter(registro =>
                            registro.concepto.semanticTag === 'hallazgo' || registro.concepto.semanticTag === 'trastorno')
                        .map(registro => { registro['idPrestacion'] = prestacion.id; return registro; });
                    // COnceptId del informe requerido en en todas las prestaciones ambulatorias
                    if (agregar.length > 0) {
                        agregar[0].informeRequerido = prestacion.ejecucion.registros.find(r => r.concepto.conceptId === '371531000');
                    }
                    registros = [...registros, ...agregar];
                }
            });
            let registroSalida = [];
            // ordenamos los registro por fecha para que a evoluciones se generen correctamente
            registros = registros.sort(
                function (a, b) {
                    a = a.createdAt;
                    b = b.createdAt;
                    return a - b;
                });
            registros.forEach(registro => {
                let registroEncontrado = registroSalida.find(reg => {
                    if (reg.concepto.conceptId === registro.concepto.conceptId) {
                        if (reg.evoluciones.find(e => e.idRegistro === registro.valor.idRegistroOrigen)) {
                            return reg;
                        }
                    }
                });
                if (!registroEncontrado && registro.valor) {
                    let dato = {
                        concepto: registro.concepto,
                        prestaciones: [registro.idPrestacion],
                        evoluciones: [{
                            idRegistro: registro.id,
                            fechaCarga: registro.createdAt,
                            profesional: registro.createdBy.nombreCompleto,
                            fechaInicio: registro.valor.fechaInicio ? registro.valor.fechaInicio : null,
                            estado: registro.valor.estado ? registro.valor.estado : '',
                            evolucion: registro.valor.evolucion ? registro.valor.evolucion : '',
                            idRegistroOrigen: registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : null,
                            idRegistroTransformado: registro.valor.idRegistroTransformado ? registro.valor.idRegistroTransformado : null,
                            origen: registro.valor.origen ? registro.valor.origen : null,
                            idRegistroGenerado: registro.valor.idRegistroGenerado ? registro.valor.idRegistroGenerado : null,
                            informeRequerido: registro.informeRequerido ? registro.informeRequerido : null
                        }]
                    };
                    registroSalida.push(dato);
                } else {
                    let ultimaEvolucion = registroEncontrado.evoluciones[registroEncontrado.evoluciones.length - 1];
                    let nuevaEvolucion = {
                        fechaCarga: registro.createdAt,
                        idRegistro: registro.id,
                        profesional: registro.createdBy.nombreCompleto,
                        fechaInicio: registro.valor.fechaInicio ? registro.valor.fechaInicio : ultimaEvolucion.fechaInicio,
                        estado: registro.valor.estado ? registro.valor.estado : ultimaEvolucion.estado,
                        evolucion: registro.valor.evolucion ? registro.valor.evolucion : '',
                        idRegistroOrigen: registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : ultimaEvolucion.idRegistroOrigen,
                        idRegistroTransformado: registro.valor.idRegistroTransformado ? registro.valor.idRegistroTransformado : ultimaEvolucion.idRegistroTransformado,
                        origen: registro.valor.origen ? registro.valor.origen : ultimaEvolucion.origen,
                        idRegistroGenerado: registro.valor.idRegistroGenerado ? registro.valor.idRegistroGenerado : ultimaEvolucion.idRegistroGenerado,
                        informeRequerido: registro.informeRequerido ? registro.informeRequerido : null
                    };
                    registroEncontrado.prestaciones.push(registro.idPrestacion);
                    registroEncontrado.evoluciones.push(nuevaEvolucion);
                    // ordenamos las evoluciones para que la primero del array sea la ultima registrada
                    registroEncontrado.evoluciones = registroEncontrado.evoluciones.sort(
                        function (a, b) {
                            a = a.fechaCarga;
                            b = b.fechaCarga;
                            return b - a;
                        });
                }

            });
            this.cacheRegistros[idPaciente] = registroSalida;
            return registroSalida;
        }));
    }



    /**
     *
     * @param idPaciente
     * @param soloValidados
     */
    getByPacienteProcedimiento(idPaciente: any, soloValidados?: boolean) {
        return this.getByPaciente(idPaciente).pipe(map(prestaciones => {
            let registros = [];
            if (soloValidados) {
                prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            }
            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {

                    let agregar = prestacion.ejecucion.registros
                        .filter(registro =>
                            registro.concepto.semanticTag === 'procedimiento' || registro.concepto.semanticTag === 'entidad observable' || registro.concepto.semanticTag === 'régimen/tratamiento')
                        .map(registro => { registro['idPrestacion'] = prestacion.id; return registro; });

                    registros = [...registros, ...agregar];
                }
            });
            let registroSalida = [];
            // ordenamos los registro por fecha para que a evoluciones se generen correctamente
            registros = registros.sort(
                function (a, b) {
                    a = a.createdAt;
                    b = b.createdAt;
                    return a - b;
                });

            this.cacheRegistros[idPaciente] = registros;
            return registros;
        }));
    }
    /**
     *
     * @param idPaciente
     * @param soloValidados
     */
    getByPacienteElementosRegistro(idPaciente: any, soloValidados?: boolean) {
        return this.getByPaciente(idPaciente).pipe(map(prestaciones => {
            let registros = [];
            if (soloValidados) {
                prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            }
            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {

                    let agregar = prestacion.ejecucion.registros
                        .filter(registro =>
                            registro.concepto.semanticTag === 'elemento de registro')
                        .map(registro => { registro['idPrestacion'] = prestacion.id; return registro; });

                    registros = [...registros, ...agregar];
                }
            });
            let registroSalida = [];
            // ordenamos los registro por fecha para que a evoluciones se generen correctamente
            registros = registros.sort(
                function (a, b) {
                    a = a.createdAt;
                    b = b.createdAt;
                    return a - b;
                });

            this.cacheRegistros[idPaciente] = registros;
            return registros;
        }));
    }

    /**
     * Método getByPacienteMedicamento lista todos los medicamentos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteMedicamento(idPaciente: any, soloValidados?: boolean): Observable<any[]> {
        return this.getByPaciente(idPaciente, false).pipe(map(prestaciones => {
            let registros = [];
            if (soloValidados) {
                prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            }
            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    let agregar = prestacion.ejecucion.registros
                        .filter(registro =>
                            registro.concepto.semanticTag === 'producto')
                        .map(registro => { registro['idPrestacion'] = prestacion.id; return registro; });
                    registros = [...registros, ...agregar];

                }
            });
            let registroSalida = [];
            // ordenamos los registro por fecha para que a evoluciones se generen correctamente
            registros = registros.sort(
                function (a, b) {
                    a = a.createdAt;
                    b = b.createdAt;
                    return a - b;
                });
            registros.forEach(registro => {
                let registroEncontrado = registroSalida.find(reg => {
                    if (reg.concepto.conceptId === registro.concepto.conceptId) {
                        if (reg.evoluciones.find(e => e.idRegistro === registro.valor.idRegistroOrigen)) {
                            return reg;
                        }
                    }
                });
                if (!registroEncontrado && registro.valor) {
                    let dato = {
                        concepto: registro.concepto,
                        prestaciones: [registro.idPrestacion],
                        evoluciones: [{
                            idRegistro: registro.id,
                            fechaCarga: registro.createdAt,
                            profesional: registro.createdBy.nombreCompleto,
                            idRegistroOrigen: registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : null,
                            duracion: registro.valor.duracion ? registro.valor.duracion : null,
                            estado: registro.valor.estado ? registro.valor.estado : '',
                            indicacion: registro.valor.indicacion ? registro.valor.indicacion : '',
                            recetable: registro.valor.recetable ? registro.valor.recetable : false,
                            unidad: registro.valor.unidad ? registro.valor.unidad : '',
                            cantidad: registro.valor.cantidad ? registro.valor.cantidad : 0
                        }]
                    };
                    registroSalida.push(dato);
                } else {
                    let ultimaEvolucion = registroEncontrado.evoluciones[registroEncontrado.evoluciones.length - 1];
                    let nuevaEvolucion = {
                        fechaCarga: registro.createdAt,
                        idRegistro: registro.id,
                        profesional: registro.createdBy.nombreCompleto,
                        idRegistroOrigen: registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : ultimaEvolucion.idRegistroOrigen,
                        duracion: registro.valor.duracion ? registro.valor.duracion : ultimaEvolucion.duracion,
                        estado: registro.valor.estado ? registro.valor.estado : ultimaEvolucion.estado,
                        indicacion: registro.valor.indicacion ? registro.valor.indicacion : ultimaEvolucion.indicacion,
                        recetable: registro.valor.recetable ? registro.valor.recetable : ultimaEvolucion.recetable,
                        unidad: registro.valor.unidad ? registro.valor.unidad : '',
                        cantidad: registro.valor.cantidad ? registro.valor.cantidad : 0
                    };
                    registroEncontrado.prestaciones.push(registro.idPrestacion);
                    registroEncontrado.evoluciones.push(nuevaEvolucion);
                    // ordenamos las evoluciones para que la primero del array sea la ultima registrada
                    registroEncontrado.evoluciones = registroEncontrado.evoluciones.sort(
                        function (a, b) {
                            a = a.fechaCarga;
                            b = b.fechaCarga;
                            return b - a;
                        });
                }

            });
            this.cacheMedicamentos[idPaciente] = registroSalida;
            return registroSalida;
        }));
    }

    getByPacienteLaboratorios(idPaciente, conceptId = null) {
        let opt = {};
        if (conceptId) {
            opt = { params: { prestacion: conceptId } };
        }

        return this.server.get(`/modules/cda/paciente/${idPaciente}`, opt);
    }

    getCDAByPaciente(idPaciente, conceptId = null) {
        let opt = {};
        if (conceptId) {
            opt = { params: { prestacion: conceptId } };
        }

        return this.server.get(`/modules/cda/paciente/${idPaciente}`, opt);
    }


    /**
     * Método getUnHallazgoPaciente x Concepto obtiene un hallazgo cronico o activo con todas sus evoluciones
     * para un paciente
     * @param {String} idPaciente
     */
    getUnHallazgoPaciente(idPaciente: any, concepto: any): Observable<any> {
        // TODO: CHEQUEAR SI EL CONCEPTO ES EL MISMO O PERTENECE A IGUAL ELEMENTORUP
        let registros = [];
        // if (this.cacheRegistros[idPaciente]) {
        //     registros = this.cacheRegistros[idPaciente];
        //     return new Observable(resultado => resultado.next(registros.find(registro => registro.concepto.conceptId === concepto.conceptId)));
        // } else {
        return this.getByPacienteHallazgo(idPaciente, true).pipe(map(hallazgos =>
            hallazgos.find(registro => {
                if ((registro.concepto.conceptId === concepto.conceptId) && (registro.evoluciones[0].esCronico || registro.evoluciones[0].estado === 'activo')) {
                    return registro;
                }
            })
        ));
        // }
    }

    /**
     * Método getUnHallazgoPacienteXOrigen obtiene un hallazgo con todas sus evoluciones
     * para un paciente buscandolo por el registro de origen
     * @param {String} idPaciente
     * @param {String} idRegistroOrigen
     */
    getUnHallazgoPacienteXOrigen(idPaciente: any, idRegistroOrigen: any): Observable<any> {
        let registros = [];
        return this.getByPacienteHallazgo(idPaciente).pipe(map(hallazgos =>
            hallazgos.find(registro => {
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
        let registros = [];
        return this.getByPacienteMedicamento(idPaciente).pipe(map(registrosMed =>
            registrosMed.find(registro => {
                if (registro.evoluciones.find(e => e.idRegistro === idRegistroOrigen)) {
                    return registro;
                }
            })
        ));
    }


    /**
     * Método getById. Trae el objeto tipoPrestacion por una key.
     * @param {String} key Busca por key
     */
    getByKey(params: any, options: any = {}): Observable<IPrestacion[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt;
        opt = {
            params: params,
            options
        };

        let url = this.prestacionesUrl + '/forKey/';
        return this.server.get(url, opt);
    }

    /**
     * Buscar en la HUDS de un paciente los registros que coincidan con los conceptIds
     *
     * @param {string} idPaciente Paciente a buscar
     * @param {any[]} conceptIds Array de conceptId de SNOMED que deseo buscar
     * @returns {any[]} Prestaciones del paciente que coincidan con los conceptIds
     * @memberof PrestacionesService
     */
    getRegistrosHuds(idPaciente: string, expresion) {
        let opt = {
            params: {
                'expresion': expresion
            },
            options: {
                showError: true
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
    getPrestacionesXtipo(idPaciente: any, conceptId: any): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
            let prestacionesXtipo = [];
            prestaciones.forEach(prestacion => {
                if (prestacion.solicitud.tipoPrestacion.conceptId === conceptId) {
                    prestacionesXtipo = [...prestacionesXtipo, ...prestacion];
                }
            });
            return prestacionesXtipo;
        });
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
    inicializarPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', ambitoOrigen = 'ambulatorio', fecha: Date = new Date(), turno: any = null, _profesional: any = null): any {
        let pacientePrestacion;
        if (!paciente) {
            pacientePrestacion = undefined;
        } else {
            pacientePrestacion = {
                id: paciente.id,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                documento: paciente.documento,
                sexo: paciente.sexo,
                fechaNacimiento: paciente.fechaNacimiento
            };
        }
        let prestacion = {
            paciente: pacientePrestacion
        };

        if (momento === 'solicitud') {
            prestacion['solicitud'] = {
                fecha: fecha,
                turno: turno,
                tipoPrestacion: snomedConcept,
                // profesional logueado
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                registros: []
            };

            prestacion['estados'] = {
                fecha: fecha,
                tipo: 'ejecucion'
            };

        } else if (momento === 'ejecucion') {
            let profesional;
            // Si el profesional llega por parametro.
            if (_profesional) {
                profesional = {
                    id: _profesional.id,
                    nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido,
                    documento: this.auth.usuario.documento
                };
            } else {
                profesional = {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                };
            }
            prestacion['solicitud'] = {
                fecha: fecha,
                turno: turno,
                tipoPrestacion: snomedConcept,
                // profesional logueado
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                registros: []
            };

            prestacion['ejecucion'] = {
                fecha: fecha,
                registros: [],
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre }
            };

            prestacion['estados'] = {
                fecha: fecha,
                tipo: 'ejecucion'
            };
        } else if (momento === 'validacion') {
            prestacion['solicitud'] = {
                fecha: fecha,
                turno: turno,
                tipoPrestacion: snomedConcept,
                // profesional logueado
                profesional:
                {
                    id: this.auth.profesional.id, nombre: this.auth.usuario.nombre,
                    apellido: this.auth.usuario.apellido, documento: this.auth.usuario.documento
                },
                // organizacion desde la que se solicita la prestacion
                organizacion: { id: this.auth.organizacion.id, nombre: this.auth.organizacion.nombre },
                registros: []
            };

            prestacion['estados'] = {
                fecha: fecha,
                tipo: 'pendiente'
            };
        }
        if (paciente) {
            prestacion.paciente['_id'] = paciente.id;
            prestacion['solicitud'].ambitoOrigen = ambitoOrigen;
        }

        return prestacion;
    }

    crearPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', fecha: any = new Date(), turno: any = null): Observable<any> {
        let prestacion = this.inicializarPrestacion(paciente, snomedConcept, momento, 'ambulatorio', fecha, turno);
        return this.post(prestacion);
    }

    validarPrestacion(prestacion, planes): Observable<any> {
        let planesCrear = undefined;

        if (planes.length) {
            planesCrear = [];
            planes.forEach(plan => {
                if (plan.semanticTag !== 'metadato fundacional') {

                    // verificamos si existe la prestacion creada anteriormente. Para no duplicar.
                    let existePrestacion = null;
                    if (this.cache[prestacion.paciente.id]) {
                        existePrestacion = this.cache[prestacion.paciente.id].find(p => p.estados[p.estados.length - 1].tipo === 'pendiente' && p.solicitud.prestacionOrigen === prestacion.id && p.solicitud.registros[0]._id === plan.id);
                    }
                    if (!existePrestacion) {
                        // Si se trata de una autocitación o consulta de seguimiento donde el profesional selecciono
                        // que prestacion quiere solicitar debo hacer ese cambio
                        let conceptoSolicitud = plan.concepto;
                        if (plan.valor && plan.valor.solicitudPrestacion.prestacionSolicitada) {
                            conceptoSolicitud = plan.valor.solicitudPrestacion.prestacionSolicitada;
                        }

                        // Controlemos que se trata de una prestación turneable.
                        // Solo creamos prestaciones pendiente para conceptos turneables

                        let existeConcepto = this.conceptosTurneables.find(c => c.conceptId === conceptoSolicitud.conceptId && c.term === conceptoSolicitud.term);
                        if (existeConcepto) {
                            // creamos objeto de prestacion
                            let nuevaPrestacion = this.inicializarPrestacion(prestacion.paciente, existeConcepto, 'validacion', 'ambulatorio');
                            // asignamos el tipoPrestacionOrigen a la solicitud
                            nuevaPrestacion.solicitud.tipoPrestacionOrigen = prestacion.solicitud.tipoPrestacion;
                            // asignamos la prestacion de origen
                            nuevaPrestacion.solicitud.prestacionOrigen = prestacion.id;

                            // Asignamos organizacionOrigen y profesionalOrigen de la solicitud originada
                            nuevaPrestacion.solicitud.organizacionOrigen = prestacion.solicitud.organizacion;
                            nuevaPrestacion.solicitud.profesionalOrigen = prestacion.solicitud.profesional;

                            // Si se asignó una organización destino desde la prestación que origina la solicitud
                            if (plan.valor.solicitudPrestacion.organizacionDestino) {
                                nuevaPrestacion.solicitud.organizacion = plan.valor.solicitudPrestacion.organizacionDestino;
                            }
                            // Si se asignó un profesional destino desde la prestación que origina la solicitud
                            if (!plan.valor.solicitudPrestacion.autocitado) {
                                nuevaPrestacion.solicitud.profesional = {};
                            }
                            if (plan.valor.solicitudPrestacion.profesionalesDestino) {
                                nuevaPrestacion.solicitud.profesional = plan.valor.solicitudPrestacion.profesionalesDestino[0];
                            }

                            // agregamos los registros en la solicitud
                            nuevaPrestacion.solicitud.registros.push(plan);

                            planesCrear.push(nuevaPrestacion);
                        }
                    }
                }
            });

        }
        // hacemos el patch y luego creamos los planes
        prestacion.ejecucion.registros.forEach(x => {
            if (x.relacionadoCon && x.relacionadoCon.length) {
                x.relacionadoCon.forEach(y => {
                    delete y.relacionadoCon;
                });
            }
        });

        let dto: any = {
            op: 'estadoPush',
            estado: { tipo: 'validada' },
            ...(planesCrear && planesCrear.length) && { planes: planesCrear },
            registros: prestacion.ejecucion.registros,
            registrarFrecuentes: true
        };
        return this.patch(prestacion.id, dto);

    }
    /**
    * Método clonar. Inserta una copia de una prestacion.
    * @param {any} prestacionCopia Recibe una copia de una prestacion
    */
    clonar(prestacionCopia: any, estado: any): Observable<any> {

        // Agregamos el estado de la prestacion copiada.
        prestacionCopia.estados.push(estado);

        // Eliminamos los id de la prestacion
        delete prestacionCopia.id;
        delete prestacionCopia._id;

        return this.server.post(this.prestacionesUrl, prestacionCopia);
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
        return this.getByPaciente(idPaciente, recarga).pipe(map(listadoPrestaciones => {
            let prestacionPlanes = [];
            if (this.cache[idPaciente]) {
                prestacionPlanes = this.cache[idPaciente].filter(p => p.estados[p.estados.length - 1].tipo === 'pendiente' && p.solicitud.prestacionOrigen === idPrestacion);
                return prestacionPlanes;
            } else {
                return null;
            }
        }));
    }

    /**
     * Devuelve si un concepto es turneable o no.
     * Se fija en la variable conceptosTurneables inicializada en OnInit
     *
     * @param {any} concepto Concepto SNOMED a verificar si esta en el array de conceptosTurneables
     * @returns  boolean TRUE/FALSE si es turneable o no
     * @memberof BuscadorComponent
     */
    public esTurneable(concepto) {
        if (!this.conceptosTurneables) {
            return false;
        }

        return this.conceptosTurneables.find(x => {
            return x.conceptId === concepto.conceptId;
        });
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
     * Determina la clase a utilizar segun sematicTag de un concepto de SNOMED o si es turneable
        *
     * @param {any} conceptoSNOMED Concepto SNOMED a determinar tipo de icono
     * @param {null} filtroActual Si estoy desde el buscador puedo indicar en que filtro estoy parado
     * @returns string Clase a ser utilizado para estilizar las cards de RUP
     * @memberof PrestacionesService
     */
    public getCssClass(conceptoSNOMED, filtroActual) {
        let clase = conceptoSNOMED.semanticTag;

        if (conceptoSNOMED.plan || this.esTurneable(conceptoSNOMED) || (typeof filtroActual !== 'undefined' && filtroActual === 'planes')) {
            clase = 'solicitud';
        } else if (conceptoSNOMED.semanticTag === 'régimen/tratamiento') {
            clase = 'regimen';
        } else if (conceptoSNOMED.semanticTag === 'elemento de registro') {
            clase = 'elementoderegistro';
        }

        return clase;
    }

    /**
     * Determina el icono a utilizar segun sematicTag de un concepto de SNOMED o si es turneable
     *
     * @param {any} conceptoSNOMED Concepto SNOMED a determinar tipo de icono
     * @param {null} filtroActual Si estoy desde el buscador puedo indicar en que filtro estoy parado
     * @returns string Icono a ser utilizado por la font de RUP
     * @memberof PrestacionesService
     */
    public getIcon(conceptoSNOMED, filtroActual: null) {
        let icon = conceptoSNOMED.semanticTag;

        if (conceptoSNOMED.plan || this.esTurneable(conceptoSNOMED) || (typeof filtroActual !== 'undefined' && filtroActual === 'planes')) {
            icon = 'plan';
        } else {
            switch (conceptoSNOMED.semanticTag) {
                case 'hallazgo':
                case 'situación':
                    icon = 'hallazgo';
                    break;

                case 'trastorno':
                    icon = 'trastorno';
                    break;

                case 'procedimiento':
                case 'entidad observable':
                case 'régimen/tratamiento':
                    icon = 'procedimiento';
                    break;
                case 'trastorno':
                    icon = 'trastorno';
                    break;
                case 'producto':
                    icon = 'producto';
                    break;

                case 'elemento de registro':
                    icon = 'elementoderegistro';
                    break;
            }
        }

        return icon;
    }

    /*******
     * INTERNACION
     */

    /**
    * Devuelve el la ultima internacion del paciente y la cama ocupada en caso que corresponda
    *
    * @param {any} paciente id del paciente en internacion
    * @param {any} estado estado de la internacion
    * @param {any} organizacion organizacion en la que se ejecuta la internacion (puede ser null)
    * @returns  {array} Ultima Internacion del paciente en el estado que ingresa por parametro
    * @memberof PrestacionesService
    */
    public internacionesXPaciente(paciente, estado, organizacion) {
        let opt = { params: { estado: estado, ambitoOrigen: 'internacion', organizacion: organizacion }, options: {} };
        return this.server.get('/modules/rup/internaciones/ultima/' + (paciente.id ? paciente.id : paciente._id), opt);
    }


    /**
   * Devuelve el listado de estados de la/s camas por las que paso la internación
   *
   * @param {any} idInternacion id de la intenacion
   * @returns  {array} lista de camas-estados por los que paso la internación
   * @memberof PrestacionesService
   */
    public getPasesInternacion(idInternacion) {
        return this.server.get('/modules/rup/internaciones/pases/' + idInternacion, null);
    }

    /**
     * Método get. Trae lista de objetos prestacion.
     *
     * @param {*} idOrganizacion Opciones de búsqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    getInternacionesPendientes(options: any = {}): Observable<IPrestacion[]> {
        return this.server.get(this.prestacionesUrl + '/sincama', options);
    }
}
