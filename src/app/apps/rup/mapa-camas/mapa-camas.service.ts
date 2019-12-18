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

    getCama(ambito, capa, fecha, idCama): Observable<any[]> {
        return this.server.get(this.url + `/camas/${idCama}`, {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    patchCama(cama, ambito, capa, fecha) {
        let params = {
            ...cama, ambito, capa, fecha
        };
        if (cama._id) {
            return this.server.patch(this.url + `/camas/${cama._id}`, {
                params,
                showError: true
            });
        } else {
            return this.server.post(this.url + `/camas`, {
                params: { ...cama, ambito, capa },
                showError: true
            });
        }
    }

    getMaquinaEstados(organizacion, ambito, capa): Observable<any[]> {
        return this.server.get(this.url + `/estados`, {
            params: { organizacion, ambito, capa },
            showError: true
        });
    }

    censoDiario(fecha, unidadOrganizativa): Observable<any[]> {
        return this.server.get(this.url + '/censoDiario', {
            params: { fecha, unidadOrganizativa },
            showError: true
        });
    }

    censoMensual(fechaDesde, fechaHasta, unidadOrganizativa): Observable<any[]> {
        return this.server.get(this.url + '/censoMensual', {
            params: { fechaDesde, fechaHasta, unidadOrganizativa },
            showError: true
        });
    }
}
