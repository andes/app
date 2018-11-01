import * as https from 'https';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Server } from '@andes/shared';


@Injectable()
export class PermisosService {

    private permisosUrl = '/core/tm/permisos';  // URL to web api

    constructor(private server: Server) { }

    get(): Observable<any> {
        return this.server.get(this.permisosUrl);
    }

    organizaciones(params): Observable<any> {
        return this.server.get('/auth/organizaciones', { params });
    }

}
