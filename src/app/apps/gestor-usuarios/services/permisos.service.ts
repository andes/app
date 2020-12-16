import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server, Cache } from '@andes/shared';


@Injectable()
export class PermisosService {

    private permisosUrl = '/core/tm/permisos';  // URL to web api

    constructor(private server: Server) { }

    @Cache({ key: null })
    get(params?): Observable<any> {
        return this.server.get(this.permisosUrl, { params });
    }

    // [TODO] Poner cache
    // @Cache({})
    organizaciones(): Observable<any> {
        return this.server.get('/modules/gestor-usuarios/organizaciones', {});
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
