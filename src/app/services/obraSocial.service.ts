import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { IBarrio } from './../interfaces/IBarrio';

@Injectable()
export class ObraSocialService {
    private url = '/modules/obraSocial';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     *
     * @param {*} dni
     * @returns {Observable<any>}
     * @memberof ObraSocialService
     */
    get(dni: any): Observable<any> {
        return this.server.get(this.url + '/puco/' + dni);
    }
}
//
