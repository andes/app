/* eslint-disable no-console */
import { Injectable } from '@angular/core';
import { ResourceBaseHttp, Server } from '@andes/shared';
import { Observable, tap } from 'rxjs';
import { IInformeEstadistica } from '../interfaces/informe-estadistica.interface'; // ruta según tu estructura

@Injectable({
    providedIn: 'root'
})
export class InformeEstadisticaService extends ResourceBaseHttp {
    protected override url = '/modules/rup/internacion/informe-estadistica';

    constructor(protected override server: Server) {
        super(server);
    }

    /**
     * Crear un nuevo informe estadístico
     */
    CreateInforme(data: IInformeEstadistica): Observable<IInformeEstadistica> {
        return this.server.post(this.url, data);
    }

    /**
     * Actualizar un informe existente
     */
    updateInforme(id: string, data: Partial<IInformeEstadistica>): Observable<IInformeEstadistica> {
        return this.server.patch(`${this.url}/${id}`, data);
    }
    /**
     * Obtener un informe por su ID
     */
    getById(id: string): Observable<IInformeEstadistica> {
        const url = `${this.url}/${id}`;
        return this.server.get(url);
    }

    get(params: any = {}, options: any = {}): Observable<IInformeEstadistica[]> {
        if (typeof options.showError === 'undefined') {
            options.showError = true;
        }
        const opt = { params, options };

        return this.server.get(this.url, opt);
    }
}
