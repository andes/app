import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class EstAgendasService {

    private baseURL = '/modules/turnos';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     *
     * @param params Filtros de busqueda
     */

    post (params) {
        return this.server.post(this.baseURL + '/dashboard', params);
    }

    postFiltroPorCiudad (params) {
        return this.server.post(this.baseURL + '/dashboard/localidades', params);
    }

    descargarCSV (data) {
        return this.server.post(this.baseURL + '/dashboard/descargarCsv', data, {responseType: 'blob'});
    }

}
