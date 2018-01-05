import { TipoPrestacionService } from './../../../services/tipoPrestacion.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { IPrestacion } from '../interfaces/prestacion.interface';

@Injectable()
export class PrestacionesService {

    private prestacionesUrl = '/modules/rup/prestaciones';  // URL to web api
    private cache: any[] = [];
    private cacheRegistros: any[] = [];
    private cacheMedicamentos: any[] = [];
    public refsetsIds = {
        cronico: '1641000013105',
        // programable: '1661000013109',
        Antecedentes_Familiares: '1621000013103',
        Antecedentes_Personales_procedimientos: '1911000013100',
        Antecedentes_Personales_hallazgos: '1901000013103'
    };

    constructor(private server: Server, public auth: Auth) { }

    /**
     * Metodo get. Trae lista de objetos prestacion.
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacion[]>}
     *
     * @memberof PrestacionesService
     */
    get(params: any, options: any = {}): Observable<IPrestacion[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }

        let opt = { params: params, options };

        return this.server.get(this.prestacionesUrl, opt);
    }
    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
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
     * Metodo getByPaciente. Busca todas las prestaciones de un paciente
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
            return this.server.get(this.prestacionesUrl, opt).map(data => {
                this.cache[idPaciente] = data;
                // Limpiamos la cache de registros por si hubo modificaciones en las prestaciones
                this.cacheRegistros[idPaciente] = null;
                return this.cache[idPaciente];
            });
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
     * Metodo getByPacienteKey
     * @param {String} idPaciente
     */
    getByPacienteKey(idPaciente: any, key: any): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
            let registros = [];

            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    registros = [...registros, ...prestacion.ejecucion.registros];

                }
            });
            let registroSalida = [];
            let registroEncontrado = this.findValues(registros, key);
            if (registroEncontrado && registroEncontrado.length > 0) {
                return registroEncontrado[0];
            }
            return null;
        });
    }

    /**
     * Metodo getByPacienteKey
     * @param {String} idPaciente
     */
    getRegistroById(idPaciente: any, id: any): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
            let registros = [];

            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    registros = [...registros, ...prestacion.ejecucion.registros];

                }
            });
            return registros.find(r => r.id === id);

        });
    }

    /**
     * Metodo getByPacienteHallazgo lista todo los hallazgos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteHallazgo(idPaciente: any, soloValidados?: boolean): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
            let registros = [];
            if (soloValidados) {
                prestaciones = prestaciones.filter(p => p.estados[p.estados.length - 1].tipo === 'validada');
            }
            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    let agregar = prestacion.ejecucion.registros
                        .filter(registro =>
                            registro.concepto.semanticTag === 'hallazgo' || registro.concepto.semanticTag === 'trastorno')
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
                            fechaInicio: registro.valor.fechaInicio ? registro.valor.fechaInicio : null,
                            estado: registro.valor.estado ? registro.valor.estado : '',
                            evolucion: registro.valor.evolucion ? registro.valor.evolucion : '',
                            idRegistroOrigen: registro.valor.idRegistroOrigen ? registro.valor.idRegistroOrigen : null,
                            idRegistroTransformado: registro.valor.idRegistroTransformado ? registro.valor.idRegistroTransformado : null,
                            origen: registro.valor.origen ? registro.valor.origen : null,
                            idRegistroGenerado: registro.valor.idRegistroGenerado ? registro.valor.idRegistroGenerado : null
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
                        idRegistroGenerado: registro.valor.idRegistroGenerado ? registro.valor.idRegistroGenerado : ultimaEvolucion.idRegistroGenerado
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
        });
    }


    /**
     * Metodo getByPacienteMedicamento lista todos los medicamentos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteMedicamento(idPaciente: any, soloValidados?: boolean): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
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
        });
    }


    /**
     * Metodo getUnHallazgoPaciente x Concepto obtiene un hallazgo cronico o activo con todas sus evoluciones
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
        return this.getByPacienteHallazgo(idPaciente, true).map(hallazgos =>
            hallazgos.find(registro => {
                if ((registro.concepto.conceptId === concepto.conceptId) && (registro.evoluciones[0].esCronico || registro.evoluciones[0].estado === 'activo')) {
                    return registro;
                }
            })
        );
        // }
    }

    /**
     * Metodo getUnHallazgoPacienteXOrigen obtiene un hallazgo con todas sus evoluciones
     * para un paciente buscandolo por el registro de origen
     * @param {String} idPaciente
     * @param {String} idRegistroOrigen
     */
    getUnHallazgoPacienteXOrigen(idPaciente: any, idRegistroOrigen: any): Observable<any> {
        let registros = [];
        return this.getByPacienteHallazgo(idPaciente).map(hallazgos =>
            hallazgos.find(registro => {
                if (registro.evoluciones.find(e => e.idRegistro === idRegistroOrigen)) {
                    return registro;
                }
            })
        );
    }


    /**
         * Metodo getUnMedicamentoXOrigen obtiene un registro de medicamento con todas sus evoluciones
         * para un paciente buscandolo por el registro de origen
         * @param {String} idPaciente
         * @param {String} idRegistroOrigen
         */
    getUnMedicamentoXOrigen(idPaciente: any, idRegistroOrigen: any): Observable<any> {
        let registros = [];
        return this.getByPacienteMedicamento(idPaciente).map(registrosMed =>
            registrosMed.find(registro => {
                if (registro.evoluciones.find(e => e.idRegistro === idRegistroOrigen)) {
                    return registro;
                }
            })
        );
    }


    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
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

    getRegistrosEjecucion(idPaciente: string, conceptIds: any[]) {
        let opt = {
            params: {
                'idPaciente': idPaciente,
                'ordenFechaEjecucion': true,
                'conceptsIdEjecucion': conceptIds,
            },
            options: {
                showError: true
            }
        };

        return this.server.get(this.prestacionesUrl, opt);
    }
    /**
     * Metodo post. Inserta un objeto nuevo.
     * @param {any} prestacion Recibe solicitud RUP con paciente
     */
    post(prestacion: any): Observable<any> {
        return this.server.post(this.prestacionesUrl, prestacion);
    }

    /**
     * Metodo put. Actualiza un objeto prestacionPaciente.
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
    inicializarPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', fecha: any = new Date(), turno: any = null): any {
        let prestacion = {
            paciente: {
                id: paciente.id,
                nombre: paciente.nombre,
                apellido: paciente.apellido,
                documento: paciente.documento,
                sexo: paciente.sexo,
                fechaNacimiento: paciente.fechaNacimiento
            }
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

        prestacion.paciente['_id'] = paciente.id;

        return prestacion;
    }

    crearPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', fecha: any = new Date(), turno: any = null): Observable<any> {
        let prestacion = this.inicializarPrestacion(paciente, snomedConcept, momento, fecha, turno);
        return this.post(prestacion);
    }

    validarPrestacion(prestacion, planes, conceptosTurneables): Observable<any> {

        let planesCrear = [];
        if (planes.length) {

            planes.forEach(plan => {

                // verificamos si existe la prestacion creada anteriormente. Para no duplicar.
                let existePrestacion = this.cache[prestacion.paciente.id].find(p => p.estados[p.estados.length - 1].tipo === 'pendiente' && p.solicitud.prestacionOrigen === prestacion.id && p.solicitud.registros[0]._id === plan.id);

                if (!existePrestacion) {

                    // Si se trata de una autocitación o consulta de seguimiento donde el profesional selecciono
                    // que prestacion quiere solicitar debo hacer ese cambio
                    let conceptoSolicitud = plan.concepto;
                    if (plan.valor && plan.valor.solicitudPrestacion.prestacionSolicitada) {
                        conceptoSolicitud = plan.valor.solicitudPrestacion.prestacionSolicitada;
                    }

                    // Controlemos que se trata de una prestación turneable.
                    // Solo creamos prestaciones pendiente para conceptos turneables
                    let existeConcepto = conceptosTurneables.find(c => c.conceptId === conceptoSolicitud.conceptId);
                    if (existeConcepto) {
                        // creamos objeto de prestacion
                        let nuevaPrestacion = this.inicializarPrestacion(prestacion.paciente, conceptoSolicitud, 'validacion');
                        // asignamos la prestacion de origen
                        nuevaPrestacion.solicitud.prestacionOrigen = prestacion.id;

                        // agregamos los registros en la solicitud
                        nuevaPrestacion.solicitud.registros.push(plan);

                        planesCrear.push(nuevaPrestacion);
                    }
                }
            });

            // hacemos el patch y luego creamos los planes
            let dto: any = {
                op: 'estadoPush',
                estado: { tipo: 'validada' },
                ...(planesCrear.length) && { planes: planesCrear },
                registros: prestacion.ejecucion.registros
            };

            return this.patch(prestacion.id, dto);


        } else {
            // hacemos el patch y luego creamos los planes
            let dto: any = {
                op: 'estadoPush',
                estado: { tipo: 'validada' },
                registros: prestacion.ejecucion.registros
            };

            return this.patch(prestacion.id, dto);
        }

    }
    /**
    * Metodo clonar. Inserta una copia de una prestacion.
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
}
