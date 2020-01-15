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

    historial(ambito: string, capa: string, cama: string, desde: Date, hasta: Date): Observable<any[]> {
        const params = {
            ambito,
            capa,
            desde,
            hasta
        };
        return this.server.get(`${this.url}/camas/${cama}/historial`, { params });
    }

    getCama(ambito, capa, fecha, idCama): Observable<any[]> {
        return this.server.get(this.url + `/camas/${idCama}`, {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    patchCama(data, ambito, capa, fecha) {
        let params = {
            ...data, ambito, capa, fecha
        };
        if (data._id) {
            return this.server.patch(this.url + `/camas/${data._id}`, {
                params,
                showError: true
            });
        } else {
            return this.server.post(this.url + `/camas`, {
                params: { ...data, ambito, capa },
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
