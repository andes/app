import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IInformeEstadistica } from '../interfaces/informe-estadistica.interface';

@Injectable({
    providedIn: 'root'
})
export class InformeEstadisticaService {
    private baseUrl = '/modules/rup/internacion/informe-estadistica';

    constructor(private server: Server) { }

    get(params?: any): Observable<IInformeEstadistica[]> {
        return this.server.get(this.baseUrl, { params });
    }

    getById(id: string): Observable<IInformeEstadistica> {
        return this.server.get(`${this.baseUrl}/${id}`);
    }

    post(data: IInformeEstadistica): Observable<IInformeEstadistica> {
        return this.server.post(this.baseUrl, data);
    }

    put(id: string, data: IInformeEstadistica): Observable<IInformeEstadistica> {
        return this.server.put(`${this.baseUrl}/${id}`, data);
    }
}
