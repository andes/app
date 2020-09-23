import { IProvincia } from './../interfaces/IProvincia';
import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class ProvinciaService {

    private provinciaUrl = '/core/tm/provincias';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<IProvincia[]> {
        const key = (params.nombre || params.pais) || 'todos';
        return this.server.get(this.provinciaUrl, { params: params, showError: true }).pipe(
            cacheStorage('provincias-' + key)
        );
    }
}
