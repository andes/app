import { IHallazgo } from './../../interfaces/rup/IHallazgo';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { Server } from '@andes/shared';
import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';

@Injectable()
export class PrestacionPacienteService {

    private prestacionesUrl = '/modules/rup/prestaciones';  // URL to web api
    private cache: any[] = [];

    constructor(private server: Server) { }

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
    getByPaciente(idPaciente: any): Observable<any[]> {
        debugger;
        if (this.cache[idPaciente]) {
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
                return this.cache[idPaciente];
            });
        }

    }

    /**
     * Metodo getByHallazo. 
     * @param {String} idPaciente
     */
    getByHallazgoPaciente(idPaciente: String): Observable<any[]> {
        return this.getByPaciente(idPaciente).map(prestaciones => {
            debugger;
            let registros = [];
            prestaciones.forEach(prestacion => {
                if (prestacion.ejecucion) {
                    registros = [...registros, ...prestacion.ejecucion.registros.filter(registro =>
                        registro.concepto.semanticTag === 'hallazgo' || registro.concepto.semanticTag === 'trastorno')];

                }
            });
            let registroSalida = [];
            registros.forEach(registro => {
                let registroEncontrado = registroSalida.find(reg => reg.concepto.conceptId === registro.concepto.conceptId);
                if (!registroEncontrado) {
                    let dato = {
                        concepto: registro.concepto,
                        evoluciones: [{
                            fechaCarga: registro.createdAt,
                            fechaInicio: registro.valor.fechaInicio ? registro.valor.fechaInicio : null,
                            descripcion: registro.valor.descripcion ? registro.valor.descripcion : '',
                            estado: registro.valor.estado ? registro.valor.estado : '',
                            esCronico: registro.valor.esCronico ? registro.valor.esCronico : false,
                            esEnmienda: registro.valor.esEnmienda ? registro.valor.esEnmienda : false,
                            evolucion: registro.valor.evolucion ? registro.valor.evolucion : ''
                        }]
                    };
                    registroSalida.push(dato);
                } else {
                    registroEncontrado.evoluciones.push(registro.valor);
                    registroSalida.push(registroEncontrado);
                }

            });
            return registroSalida;
        });
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
     * Metodo post. Inserta un objeto prestacionPaciente nuevo.
     * @param {IPrestacionPaciente} prestacion Recibe IPrestacionPaciente
     */
    post(prestacion: any): Observable<IPrestacionPaciente> {
        return this.server.post(this.prestacionesUrl, prestacion);
    }

    /**
     * Metodo put. Actualiza un objeto prestacionPaciente.
     * @param {IPrestacionPaciente} problema Recibe IPrestacionPaciente
     */
    put(prestacion: IPrestacionPaciente): Observable<IPrestacionPaciente> {
        return this.server.put(this.prestacionesUrl + '/' + prestacion.id, prestacion);
    }

    patch(prestacion: IPrestacionPaciente, cambios: any): Observable<IPrestacionPaciente> {
        return this.server.patch(this.prestacionesUrl + '/' + prestacion.id, cambios);
    }

    // tslint:disable-next-line:eofline
}
