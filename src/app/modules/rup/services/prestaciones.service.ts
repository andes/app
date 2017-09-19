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
        let opt;
        opt = {
            params: params,
            options
        };

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
                    'ordenFecha': true
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
                            origen: registro.valor.origen ? registro.valor.origen : null
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
        return this.getByPacienteHallazgo(idPaciente).map(hallazgos =>
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

    validarPrestacion(prestacion, planes): Observable<any> {
        let planesCrear = [];

        if (planes.length) {
            planes.forEach(plan => {

                // creamos objeto de prestacion
                let nuevaPrestacion = this.inicializarPrestacion(prestacion.paciente, plan.concepto, 'validacion');

                // asignamos la prestacion de origen
                nuevaPrestacion.solicitud.prestacionOrigen = prestacion.id;

                // agregamos los registros en la solicitud
                nuevaPrestacion.solicitud.registros.push(plan);

                planesCrear.push(nuevaPrestacion);

                // this.servicioPrestacion.post(nuevaPrestacion).subscribe((data) => {
                //     // jfgabriel // ESTO ES UN RECONTRA-PARCHE !!! SOLO A LOS EFECTOS DE MOSTRAR LA FUNCIONALIDAD
                //     this.solicitudTurno = data;
                // });
            });
        }

        // hacemos el patch y luego creamos los planes
        let dto: any = {
            op: 'estadoPush',
            estado: { tipo: 'validada' },
            ...(planesCrear.length) && { planes: planesCrear }
        };

        return this.patch(prestacion.id, dto);

        // // Creamos las prestaciones en pendiente
        // // TODO: ESTO DEBERÍA HACERLO LA API?!?!??
        // this.servicioPrestacion.patch(this.prestacion.id, cambioEstado).subscribe(prestacion => {
        //     this.prestacion = prestacion;

        //     // buscamos los planes dentro de los registros

        // });
    }
}
