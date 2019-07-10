import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class PeriodoPadronesProfeService {
    private url = '/modules/obraSocial';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene las fechas de las actualizaciones mensuales de los padrones Incluir Salud
     *
     * @param {*} dni
     * @returns {Observable<any>}
     * @memberof ObraSocialService
     */

    get(opciones: any): Observable<any> {
        return this.server.get(this.url + '/periodoPadronesProfe/', { params: opciones });
    }
}
