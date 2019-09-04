import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Server, Cache } from '@andes/shared';


@Injectable()
export class Permisos2Service {

    private permisosUrl = '/core/tm/permisos';  // URL to web api

    constructor(private server: Server) { }

    get(params?): Observable<any> {
        return this.server.get(this.permisosUrl, { params });
    }

    // [TODO] Poner cache
    // @Cache({})
    organizaciones(params): Observable<any> {
        return this.server.get('/auth/organizaciones', { params });
    }

    actualizarEstadoPermisos(username, idOrganizacion) {
        return this.server.put('/auth/estadoPermisos' + '/' + username, { idOrganizacion });
    }


    copyPermisos = null;
    copy(permisos: string[]) {
        this.copyPermisos = permisos;
    }

    paste() {
        const cp = this.copyPermisos;
        this.copyPermisos = null;
        return cp;
    }

    hasCopy() {
        return this.copyPermisos !== null;
    }
}
