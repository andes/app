import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';
import { AppSettings } from './../../appSettings';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Server } from 'andes-shared/src/lib/server/server.service';

@Injectable()
export class ProblemaPacienteService {

    private problemaUrl = AppSettings.API_ENDPOINT + '/modules/rup';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto tipoPrestacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IProblemaPaciente[]> {
        let url = this.problemaUrl + "/pacientes/" + params.idPaciente + "/problemas";
        return this.server.get(url, params)
    }
    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(idPaciente: String, idProblema: String): Observable<IProblemaPaciente> {
        var url = this.problemaUrl + "/pacientes/" + idPaciente + "/problemas/" + idProblema;
        return this.server.get(url, null)
    }

}