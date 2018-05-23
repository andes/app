import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class EstAgendasService {

    private baseURL = '/modules/turnos/estadistica';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     *
     * @param params Filtros de busqueda
     */

    get (params) {
        return this.server.get(this.baseURL, { params });
    }

}
