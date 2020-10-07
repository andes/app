import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IPais } from './../interfaces/IPais';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable()
export class PaisService {

    private paisUrl = '/core/tm/paises';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<IPais[]> {
        // Se usa de dos formas distintas en la app, para no estar modificando todo queda este IF.
        if (params && params.nombre) {
            return this.server.get(this.paisUrl, { params: params, showError: true }).pipe(
                cacheStorage({ key: 'paises-' + params.nombre, ttl: 60 * 24 })
            );
        } else {
            return this.server.get(this.paisUrl, { params: params, showError: true }).pipe(
                cacheStorage({ key: 'paises', ttl: 60 * 24 })
            );
        }
    }

}
