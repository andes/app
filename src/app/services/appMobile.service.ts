import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class AppMobileService {

    // URL to web api
    private mobileUrl = '/modules/mobileApp/';

    constructor(private server: Server) { }

    /**
     * Activa una cuenta app mobile para un paciete
     * @param {objectid} idPaciente
     * @param {object} contacto Email y telefono del paciente
     */

    create(idPaciente: string, contacto: any): Observable<any> {
        return this.server.post(this.mobileUrl + 'create' + '/' + idPaciente, contacto);
    }

    /**
     * Chequea que un paciente tenga una cuenta mobile
     * @param {objectId} idPaciente
     */
    check(idPaciente: string): Observable<any> {
        return this.server.get(this.mobileUrl + 'check' + '/' + idPaciente, {});
    }

    /**
     * Devuelve una cuenta segun email, en caso de que exista
     * @param {String} email
     */
    getByEmail(email: string): Observable<any> {
        return this.server.get(this.mobileUrl + 'email/' + email, {});
    }

    /**
     * Reenvía el código de verificación a un paciente
     * @param {objectId} idPaciente
     */

    reenviar(idPaciente, data): Observable<any> {
        return this.server.post(this.mobileUrl + 'v2/reenviar-codigo', { id: idPaciente, contacto: data.contacto });
    }

}
