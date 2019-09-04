import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Server } from '@andes/shared';
import { BehaviorSubject, zip } from 'rxjs';
import { switchMap, distinctUntilChanged, map, tap, publishReplay, refCount, combineAll, merge } from 'rxjs/operators';

@Injectable()
export class UsuariosHttp {
    private url = '/modules/gestor-usuarios/usuarios';  // URL to web api

    constructor(private server: Server) {

    }

    get(id): Observable<any> {
        return this.server.get(`${this.url}/${id}`);
    }

    find(query = {}): Observable<any> {
        return this.server.get(this.url, { params: query });
    }

    create(body): Observable<any> {
        return this.server.post(this.url, body);
    }

    update(id, body): Observable<any> {
        return this.server.patch(`${this.url}/${id}`, body);
    }

    delete(id): Observable<any> {
        return this.server.delete(`${this.url}/${id}`);
    }

    ldap(id: String): Observable<any> {
        return this.server.get(`${this.url}/ldap/${id}`);
    }

    addOrganizacion(id, organizacion, body) {
        return this.server.post(`${this.url}/${id}/organizaciones/${organizacion}`, body);
    }

    updateOrganizacion(id, organizacion, body): Observable<any> {
        return this.server.patch(`${this.url}/${id}/organizaciones/${organizacion}`, body);
    }

    deleteOrganizacion(id, organizacion): Observable<any> {
        return this.server.delete(`${this.url}/${id}/organizaciones/${organizacion}`);
    }

}
