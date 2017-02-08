import { IPrestacionPaciente } from './../../interfaces/rup/IPrestacionPaciente';
import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';
import { AppSettings } from './../../appSettings';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Server } from 'andes-shared/src/lib/server/server.service';

@Injectable()
export class PrestacionPacienteService {

    private prestacionesUrl = AppSettings.API_ENDPOINT + '/modules/rup/prestaciones';  // URL to web api

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
     * Metodo put. Actualiza un objeto prestacionPaciente.
     * @param {IPrestacionPaciente} problema Recibe IPrestacionPaciente
     */
    put(prestacion: IPrestacionPaciente): Observable<IPrestacionPaciente> {
        return this.server.put(this.prestacionesUrl + "/" + prestacion.id, prestacion);
    }
}