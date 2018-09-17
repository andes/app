import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { IObraSocial } from '../interfaces/IObraSocial';

@Injectable()
export class ObraSocialService {
    private url = '/modules/obraSocial';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     *
     * @param {*} dni, periodo
     * @returns {Observable<IObraSocial>}
     * @memberof ObraSocialService
     */

    get(opciones: any): Observable<IObraSocial[]> {
        return this.server.get(this.url + '/puco/', { params: opciones });
    }

    getPadrones(opciones: any): Observable<any[]> {
        return this.server.get(this.url + '/puco/padrones', { params: opciones });
    }
}
