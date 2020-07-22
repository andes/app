import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Server } from '@andes/shared';


@Injectable()
export class UsuarioService {

    private usuarioUrl = '/modules/usuarios';  // URL to web api

    private permisosUrl = '/core/tm/permisos';

    constructor(private server: Server) { }

    permisos(): Observable<any> {
        return this.server.get(this.permisosUrl);
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
    /**
     * Obtiene los permisos para el usuario y organización pasada por parámetro.
     * Para identificar al usuario, se pasa su número de documento (matchea con nombre de usuario)
     * con nombre "dni"
     * y de la organización solo su id (con nombre "idOrganizacion")
     * @param {*} params
     * @returns {Observable<any>}
     * @memberof UsuarioService
     */
    getByDniOrg(params): Observable<any> {
        return this.server.get(this.usuarioUrl + '/dniOrg/' + params.dni, { params });
    }
    save(usuario: any): Observable<any> {
        if (usuario.id) {
            return this.server.put(this.usuarioUrl + '/' + usuario.id, usuario);
        } else {
            return this.server.post(this.usuarioUrl + '/alta', usuario);
        }

    }

    saveDisclaimer(usuario: any, disclaimer: any): Observable<any> {
        if (usuario.username) {
            return this.server.post(`/modules/gestor-usuarios/usuarios/${usuario.username}/disclaimers/${disclaimer.id}`, { usuario: usuario, disclaimer: disclaimer });
        }

    }

    getDisclaimers(usuario: any): Observable<any> {
        if (usuario.username) {
            return this.server.get(`/modules/gestor-usuarios/usuarios/${usuario.username}/disclaimers`);
        }

    }


}
