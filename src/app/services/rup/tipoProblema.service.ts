import { ITipoProblema } from './../../interfaces/rup/ITipoProblema';
import { IProblemaPaciente } from './../../interfaces/rup/IProblemaPaciente';
import { AppSettings } from './../../appSettings';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { Server } from '@andes/shared';

@Injectable()
export class TipoProblemaService {

    private tipoProblemaUrl = AppSettings.API_ENDPOINT + '/modules/rup/tiposProblemas';  // URL to web api

    constructor(private server: Server) { }

    /**
     * Metodo get. Trae el objeto tipoPrestacion.
     * @param {any} params Opciones de busqueda
     */
    get(params: any): Observable<ITipoProblema[]> {
        return this.server.get(this.tipoProblemaUrl, { params: params, showError: true });
    }

    /**
     * Metodo getById. Trae el objeto tipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<ITipoProblema> {
        let url = this.tipoProblemaUrl + '/' + id;
        return this.server.get(url, null);
    }

}