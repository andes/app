import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../../environments/environment';
import { Server } from '@andes/shared';
import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';

@Injectable()
export class PrestacionPacienteService {

    private prestacionesUrl = '/modules/rup/prestaciones';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae lista de objetos prestacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IPrestacionPaciente[]> {
        return this.server.get(this.prestacionesUrl, { params: params, showError: true })
    }
    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IPrestacionPaciente> {
        var url = this.prestacionesUrl + "/" + id;
        return this.server.get(url, null)
    }

    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getByKey(params: any): Observable<IPrestacionPaciente[]> {
        var url = this.prestacionesUrl + "/forKey/";
        return this.server.get(url, { params: params, showError: true })
    }

    /**
     * Metodo post. Inserta un objeto prestacionPaciente nuevo.
     * @param {IPrestacionPaciente} prestacion Recibe IPrestacionPaciente
     */
    post(prestacion:any): Observable<IPrestacionPaciente> {
        return this.server.post(this.prestacionesUrl, prestacion);
    }

    /**
     * Metodo put. Actualiza un objeto prestacionPaciente.
     * @param {IPrestacionPaciente} problema Recibe IPrestacionPaciente
     */
    put(prestacion: IPrestacionPaciente): Observable<IPrestacionPaciente> {
        return this.server.put(this.prestacionesUrl + "/" + prestacion.id, prestacion);
    }
}