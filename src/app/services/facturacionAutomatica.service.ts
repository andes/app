import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class FacturacionAutomaticaService {
    private url = '/modules/facturacionAutomatica';  // URL to web api

    constructor(private server: Server) { }
    /**
     * Obtiene los datos de la obra social asociada a un paciente
     *
     * @param {*} conceptId
     * @returns {Observable<any>}
     * @memberof FacturacionAutomaticaService
     */

    get(opciones: any): Observable<any> {
        return this.server.get(this.url + '/configFacturacionAutomatica/', { params: opciones });
    }

    post(turno: any): Observable<any> {
        return this.server.post(this.url + '/facturaArancelamiento', turno);
    }
}
