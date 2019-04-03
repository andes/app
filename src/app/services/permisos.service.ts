import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Server } from '@andes/shared';


@Injectable()
export class PermisosService {

    private permisosUrl = '/core/tm/permisos';  // URL to web api

    constructor(private server: Server) { }

    get(params?): Observable<any> {
        return this.server.get(this.permisosUrl, { params });
    }

    organizaciones(params): Observable<any> {
        return this.server.get('/auth/organizaciones', { params });
    }

    actualizarEstadoPermisos(username, idOrganizacion) {
        return this.server.put('/auth/estadoPermisos' + '/' + username, { idOrganizacion });
    }
}
