import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, throwError } from 'rxjs';
import { ISnapshot } from '../interfaces/ISnapshot';
import { ICama } from '../interfaces/ICama';
import { IMaquinaEstados } from '../interfaces/IMaquinaEstados';
import { map } from 'rxjs/operators';

export type IFiltrosHistorial = any;

@Injectable()
export class MapaCamasHTTP {
    private url = '/modules/rup/internacion';

    constructor(
        private server: Server
    ) { }

    snapshot(ambito: string, capa: string, fecha: Date, idInternacion: string = null, estado: string = null, idCama: string = null): Observable<ISnapshot[]> {
        return this.server.get(this.url + '/camas', {
            params: {
                ambito,
                capa,
                fecha,
                internacion: idInternacion,
                estado,
                cama: idCama
            }
        });
    }

    historial(ambito: string, capa: string, desde: Date, hasta: Date, filtros: IFiltrosHistorial): Observable<ISnapshot[]> {
        const params = {
            ambito,
            capa,
            desde,
            hasta,
            ...filtros
        };
        return this.server.get(`${this.url}/camas/historial`, { params });
    }

    get(ambito: string, capa: string, fecha: Date, idCama: string): Observable<ICama[]> {
        return this.server.get(this.url + `/camas/${idCama}`, {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    // [TODO] ver interfaz e ID
    save(ambito: string, capa: string, fecha: Date, data): Observable<ICama> {
        let params = {
            ...data,
            ambito: ambito,
            capa: capa,
            fecha
        };
        if (data._id) {
            return this.server.patch(this.url + `/camas/${data._id}`, params);
        } else {
            return this.server.post(this.url + `/camas`, { ...data, ambito, capa, fecha });
        }
    }

    changeTime(ambito, capa, cama, idInternacion, fechaOriginal, nuevaFecha) {
        let params = {
            ambito: ambito,
            capa: capa,
            fechaActualizar: fechaOriginal,
            nuevaFecha,
            idInternacion: idInternacion ? idInternacion : undefined
        };
        return this.server.patch(this.url + `/camas/changeTime/${cama._id}`, params);
    }

    getMaquinaEstados(ambito: string, capa: string, organizacion: string): Observable<IMaquinaEstados> {
        return this.server.get(this.url + `/estados`, {
            params: { organizacion, ambito, capa },
            showError: true
        }).pipe(
            map(maquinaEstados => {
                if (maquinaEstados && maquinaEstados.length > 0) {
                    return maquinaEstados[0];
                }
                throwError('NO HAY MAQUINA DE ESTADO');
            })
        );
    }

    censoDiario(fecha: Date, unidadOrganizativa: string): Observable<any[]> {
        return this.server.get(this.url + '/censoDiario', {
            params: { fecha, unidadOrganizativa },
            showError: true
        });
    }

    listaEspera(ambito: string, capa: string): Observable<any[]> {
        return this.server.get(`${this.url}/lista-espera`, { params: { ambito, capa } });
    }

    censoMensual(fechaDesde: Date, fechaHasta: Date, unidadOrganizativa: string): Observable<any[]> {
        return this.server.get(this.url + '/censoMensual', {
            params: { fechaDesde, fechaHasta, unidadOrganizativa },
            showError: true
        });
    }
}
