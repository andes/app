import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class pucoService {
    private url = '/modules/puco';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     *
     * @param {*} dni
     * @returns {Observable<any>}
     * @memberof pucoService
     */
    get(dni: any): Observable<any> {
        return this.server.get(this.url + '/puco/' + dni);
    }
}
