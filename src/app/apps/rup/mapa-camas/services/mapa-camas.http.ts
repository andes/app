import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { ISnapshot } from '../interfaces/ISnapshot';
import { ICama } from '../interfaces/ICama';

export type IFiltrosHistorial = any;

@Injectable({
    providedIn: 'root',
})
export class MapaCamasHTTP {
    private url = '/modules/rup/internacion';

    constructor(
        private server: Server
    ) { }

    snapshot(ambito: string, capa: string, fecha: Date, idInternacion: string = null, estado: string = null, idCama: string = null): Observable<ISnapshot[]> {
        return this.server.get(`${this.url}/camas`, {
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

    historialInternacion(ambito: string, capa: string, desde: Date, hasta: Date, idInternacion: string, organizacionID?: string): Observable<ISnapshot[]> {
        const params = {
            ambito,
            desde,
            hasta
        };
        if (organizacionID) {
            params['idInternacion'] = idInternacion;
        };
        return this.server.get(`${this.url}/${capa}/${idInternacion}/historial`, { params });
    }

    get(ambito: string, capa: string, fecha: Date, idCama: string): Observable<ISnapshot> {
        return this.server.get(`${this.url}/camas/${idCama}`, {
            params: { ambito, capa, fecha },
            showError: true
        });
    }

    save(data): Observable<ICama> {
        if (data._id) {
            return this.server.patch(`${this.url}/camas/${data._id}`, data);
        } else {
            return this.server.post(`${this.url}/camas`, data);
        }
    }

    // [TODO] ver interfaz e ID
    updateEstados(ambito: string, capa: string, fecha: Date, data, editado?: boolean): Observable<ICama> {
        const params = {
            ...data,
            ambito: ambito,
            capa: capa,
            fecha,
            editado
        };
        return this.server.patch(`${this.url}/camaEstados/${data._id}`, params);
    }

    deshacerInternacion(ambito: string, capa: string, idInternacion: string, completo: boolean): Observable<{ status: boolean }> {
        const params = {
            ambito: ambito,
            capa: capa,
            idInternacion,
            completo
        };
        return this.server.patch(`${this.url}/deshacer`, params);
    }

    changeTime(ambito: string, capa: string, cama, idInternacion, fechaOriginal, nuevaFecha) {
        const params = {
            ambito: ambito,
            capa: capa,
            fechaActualizar: fechaOriginal,
            nuevaFecha,
            idInternacion: idInternacion ? idInternacion : undefined
        };
        return this.server.patch(`${this.url}/camas/changeTime/${cama._id}`, params);
    }

    censoDiario(fecha: Date, unidadOrganizativa: string): Observable<any[]> {
        return this.server.get(`${this.url}/censo-diario`, {
            params: { fecha, unidadOrganizativa },
            showError: true
        });
    }

    listaEspera(ambito: string, capa: string): Observable<any[]> {
        return this.server.get(`${this.url}/lista-espera`, { params: { ambito, capa } });
    }

    censoMensual(fechaDesde: Date, fechaHasta: Date, unidadOrganizativa: string): Observable<any[]> {
        return this.server.get(`${this.url}/censo-mensual`, {
            params: { fechaDesde, fechaHasta, unidadOrganizativa },
            showError: true
        });
    }

    getPrestacionesInternacion(params: any): Observable<any[]> {
        return this.server.get(`${this.url}/prestaciones`, { params: params, showError: true });
    }
}
