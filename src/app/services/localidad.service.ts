import { Observable } from 'rxjs/Rx';
import { ILocalidad } from './../interfaces/ILocalidad';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

@Injectable()
export class LocalidadService {

    private localidadUrl = '/core/tm/localidades';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<ILocalidad[]> {
        return this.server.get(this.localidadUrl, { params: params, showError: true });
    }

    getXProvincia(provincia: String): Observable<ILocalidad[]> {
        return this.server.get(this.localidadUrl + '?provincia=' + provincia);
    }
}
