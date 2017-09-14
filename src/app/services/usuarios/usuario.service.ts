import * as https from 'https';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';


@Injectable()
export class UsuarioService {

    private usuarioUrl = '/modules/usuarios';  // URL to web api

    constructor(private server: Server) { }

    permisos() : Observable<any> {
        return this.server.get('/auth/permisos');
    }

    get(): Observable<any> {
        return this.server.get(this.usuarioUrl + '');
    }

    getUser(id: String): Observable<any> {
        return this.server.get(this.usuarioUrl + '/ldap/' + id);
    }

    getByDni(dni: Number): Observable<any> {
        return this.server.get(this.usuarioUrl + '/' + dni);
    }

    save(usuario: any): Observable<any> {
        if (usuario.id) {
            return this.server.put(this.usuarioUrl + '/' + usuario.id, usuario);
        } else {
            return this.server.post(this.usuarioUrl + '/alta', usuario);
        }

    }
}
