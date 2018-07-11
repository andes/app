import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class EstRupService {

    private baseURL = '/modules/rup/estadisticas';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     *
     * @param params Filtros de busqueda
     */

    get (params) {
        return this.server.get(this.baseURL, { params });
    }

}
