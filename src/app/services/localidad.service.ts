import { Observable } from 'rxjs';
import { ILocalidad } from './../interfaces/ILocalidad';
import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';

@Injectable()
export class LocalidadService {

    private localidadUrl = '/core/tm/localidades'; // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<ILocalidad[]> {
        return this.server.get(this.localidadUrl, { params: params, showError: true });
    }

    getXProvincia(provincia: string): Observable<ILocalidad[]> {
        return this.server.get(this.localidadUrl + '?provincia=' + provincia).pipe(
            cacheStorage({ key: 'localidades-' + provincia, ttl: 60 * 24 })
        );
    }
}
