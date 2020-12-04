import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable()
export class FacturacionAutomaticaService {
    private url = '/modules/facturacionAutomatica';  // URL to web api

    constructor(private server: Server) { }

    post(turno: any): Observable<any> {
        return this.server.post(this.url + '/facturaArancelamiento', turno);
    }
}
