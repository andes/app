import { IHallazgo } from './../../interfaces/rup/IHallazgo';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';

@Injectable()
export class PrestacionPacienteService {

    private prestacionesUrl = '/modules/rup/prestaciones';  // URL to web api
    private cache: any[] = [];
    private cacheRegistros: any[] = [];

    constructor(private server: Server, public auth: Auth) { }

    /**
     * Metodo get. Trae lista de objetos prestacion.
     *
     * @param {*} params Opciones de busqueda
     * @param {*} [options={}] Options a pasar a la API
     * @returns {Observable<IPrestacionPaciente[]>}
     *
     * @memberof PrestacionPacienteService
     */
    get(params: any, options: any = {}): Observable<any[]> {

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
    getById(id: String, options: any = {}): Observable<IPrestacionPaciente> {
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
    getByPaciente(idPaciente: any, idPrestacion?: any): Observable<any[]> {
        /*if (this.cache[idPaciente]) {
            return new Observable(resultado => resultado.next(this.cache[idPaciente]));
        } else {*/
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
                if (idPrestacion) {
                    data = data.filter(d => d.id !== idPrestacion);
                }
                this.cache[idPaciente] = data;
                return this.cache[idPaciente];
            });
        //}

    }

    /**
     * Metodo getByPacienteHallazgo lista todo los hallazgos registrados del paciente
     * @param {String} idPaciente
     */
    getByPacienteHallazgo(idPaciente: any, idPrestacion?: any): Observable<any[]> {
        return this.getByPaciente(idPaciente, idPrestacion).map(prestaciones => {
            let registros = [];
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
            registros.forEach(registro => {
                let registroEncontrado = registroSalida.find(reg => reg.concepto.conceptId === registro.concepto.conceptId);
                if (!registroEncontrado) {
                    let dato = {
                        concepto: registro.concepto,
                        idPrestacion: registro.idPrestacion,
                        evoluciones: [{
                            fechaCarga: registro.createdAt,
                            profesional: registro.createdBy.nombreCompleto,
                            fechaInicio: registro.valor.evolucionProblema.fechaInicio ? registro.valor.evolucionProblema.fechaInicio : null,
                            estado: registro.valor.evolucionProblema.estado ? registro.valor.evolucionProblema.estado : '',
                            esCronico: registro.valor.evolucionProblema.esCronico ? registro.valor.evolucionProblema.esCronico : false,
                            esEnmienda: registro.valor.evolucionProblema.esEnmienda ? registro.valor.evolucionProblema.esEnmienda : false,
                            evolucion: registro.valor.evolucionProblema.evolucion ? registro.valor.evolucionProblema.evolucion : ''
                        }]
                    };
                    registroSalida.push(dato);
                } else {
                    let ultimaEvolucion = registroEncontrado.evoluciones[registroEncontrado.evoluciones.length - 1];
                    let nuevaEvolucion = {
                        fechaCarga: registro.createdAt,
                        profesional: registro.createdBy.nombreCompleto,
                        fechaInicio: registro.valor.evolucionProblema.fechaInicio ? registro.valor.evolucionProblema.fechaInicio : ultimaEvolucion.fechaInicio,
                        estado: registro.valor.evolucionProblema.estado ? registro.valor.evolucionProblema.estado : ultimaEvolucion.estado,
                        esCronico: registro.valor.evolucionProblema.esCronico ? registro.valor.evolucionProblema.esCronico : ultimaEvolucion.esCronico,
                        esEnmienda: registro.valor.evolucionProblema.esEnmienda ? registro.valor.evolucionProblema.esEnmienda : false,
                        evolucion: registro.valor.evolucionProblema.evolucion ? registro.valor.evolucionProblema.evolucion : ''
                    };
                    registroEncontrado.evoluciones.push(nuevaEvolucion);
                }

            });
            this.cacheRegistros[idPaciente] = registroSalida;
            return registroSalida;
        });
    }


    /**
     * Metodo getHallazgoPaciente obtiene un hallazgo con todas sus evoluciones para un paciente
     * @param {String} idPaciente
     */
    getUnHallazgoPaciente(idPaciente: any, concepto: any): Observable<any> {
        // TODO: CHEQUEAR SI EL CONCEPTO ES EL MISMO O PERTENECE A IGUAL ELEMENTORUP
        // let registros = [];
        // if (this.cacheRegistros[idPaciente]) {
        //     registros = this.cacheRegistros[idPaciente];
        //     return new Observable(resultado => resultado.next(registros.find(registro => registro.concepto.conceptId === concepto.conceptId)));
        // } else {
            return this.getByPacienteHallazgo(idPaciente).map(hallazgos =>
                hallazgos.find(registro => { if (registro.concepto.conceptId === concepto.conceptId) { return registro; } })
            );
      //  }
    }

    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getByKey(params: any, options: any = {}): Observable<IPrestacionPaciente[]> {
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
    put(prestacion: IPrestacionPaciente): Observable<IPrestacionPaciente> {
        return this.server.put(this.prestacionesUrl + '/' + prestacion.id, prestacion);
    }

    patch(idPrestacion: string, cambios: any): Observable<IPrestacionPaciente> {
        return this.server.patch(this.prestacionesUrl + '/' + idPrestacion, cambios);
    }

    crearPrestacion(paciente: any, snomedConcept: any, momento: String = 'solicitud', fecha: any = new Date(), turno: any = null): Observable<any> {
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
        };

        prestacion.paciente['_id'] = paciente.id;

        return this.post(prestacion);
    }

    // tslint:disable-next-line:eofline
}
