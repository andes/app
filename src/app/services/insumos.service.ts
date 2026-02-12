import { Server } from '@andes/shared';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface IInsumoQueryParams {
    insumo: string;
    tipo: string;
    requiereEspecificacion: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class InsumosService {
    private url = '/modules/insumos';

    constructor(
        private server: Server
    ) { }

    getInsumos(params: any): Observable<any[]> {
        return this.server.get(this.url, { params });
    }
}
