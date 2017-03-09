import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';
import { AppSettings } from './../../appSettings';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Server } from '@andes/shared';

@Injectable()
export class ProblemaPacienteService {

    private problemaUrl = AppSettings.API_ENDPOINT + '/modules/rup';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae listado de objetos problema.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<IProblemaPaciente[]> {
        let url = this.problemaUrl + '/problemas';
        return this.server.get(url, { params: params, showError: true });
    }

    /**

     * Metodo getById. Trae lista de problemas del paciente por su Id de problema.
     * @param {String} idPaciente Busca por Id de paciente
     * @param {String} idProblema Busca por Id del problema
     */
    getById(idProblema: String): Observable<IProblemaPaciente> {
        let url = this.problemaUrl + '/problemas/' + idProblema;
        return this.server.get(url, null);
    }

    /**
     * Metodo post. Inserta un objeto problemaPaciente nuevo.
     * @param {IProblemaPaciente} problema Recibe IProblemaPaciente
     */
    post(problema: IProblemaPaciente): Observable<IProblemaPaciente> {
        return this.server.post(this.problemaUrl + '/problemas/', problema);
    }
    /**
     * Metodo put. Actualiza un objeto problemaPaciente.
     * @param {IProblemaPaciente} problema Recibe IProblemaPaciente
     */
    put(problema: IProblemaPaciente): Observable<IProblemaPaciente> {
        debugger;
        console.log(problema);
        return this.server.put(this.problemaUrl + '/problemas/' + problema.id, problema);
    }

    /**
     * Metodo putAll. Actualiza muchos problemaPaciente.
     * @param {IProblemaPaciente[]} problemas Recibe IProblemaPaciente[]
     */
    putAll(problemas: IProblemaPaciente[]) {
        return this.server.put(this.problemaUrl + '/problemas/', problemas);
    }



}
