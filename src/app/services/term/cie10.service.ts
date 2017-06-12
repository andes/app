import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';

@Injectable()
export class Cie10Service {
    private cie10URL = '/core/term/cie10';  // URL to web api
    constructor(private server: Server) { }

    get(params: any): Observable<any[]> {
        return this.server.get(this.cie10URL, {params: params, showError: true});
    }
    /**
     * Metodo getById. Trae el objeto de Cie10 por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<any> {
        return this.server.get(this.cie10URL + '/' + id, null);
    }

}
