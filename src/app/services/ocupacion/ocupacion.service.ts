import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class OcupacionService {
    private ocupacionUrl = '/core/tm/ocupacion'; // URL to web api
    constructor(private server: Server) { }

    /**
     * Metodo get. Trae todos  los objetos ocupacion.
     */
    getParams(params): Observable<any[]> {
        return this.server.get(this.ocupacionUrl, { params: params, showError: true });
    }
    get(): Observable<any[]> {
        return this.server.get(this.ocupacionUrl);
    }

}
