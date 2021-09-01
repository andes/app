import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class SolicitudesTopService {

    private baseURL = '/modules/rup/solicitudes/dashboard'; // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     *
     * @param params Filtros de busqueda
     */

    // get (params) {
    //     return this.server.get(this.baseURL, { params });
    // }

    post(params) {
        return this.server.post(this.baseURL, params);
    }

}
