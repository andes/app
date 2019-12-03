import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { ICama } from './interfaces/ICama';

@Injectable()
export class MapaCamasService {

    private url = '/modules/rup/internacion';
    constructor(private server: Server) { }

    snapshot(ambito, capa, fecha): Observable<any[]> {
        return this.server.get(this.url + '/camas', {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    censoDiario(fecha, unidadOrganizativa): Observable<any[]> {
        return this.server.get(this.url + '/censoDiario', {
            params: { fecha, unidadOrganizativa },
            showError: true
        });
    }
}
