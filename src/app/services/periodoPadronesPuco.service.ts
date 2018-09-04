import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class PeriodoPadronesPucoService {
    private url = '/modules/obraSocial';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene las fechas de las actualizaciones mensuales de los padrones PUCO
     *
     * @param {*} dni
     * @returns {Observable<any>}
     * @memberof ObraSocialService
     */

    get(opciones: any): Observable<any> {
        return this.server.get(this.url + '/periodoPadronesPuco/', { params: opciones });
    }
}
