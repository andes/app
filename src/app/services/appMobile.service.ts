import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

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

    create(idPaciente: String, contacto: any): Observable<any> {
        return this.server.post(this.mobileUrl + 'create' + '/' + idPaciente, contacto);
    }

    /**
     * Chequea que un paciente tenga una cuenta mobile
     * @param {objectId} idPaciente
     */
    check(idPaciente: String): Observable<any> {
        return this.server.get(this.mobileUrl + 'check' + '/' + idPaciente, {});
    }

    /**
     * Reenvía el código de verificación a un paciente
     * @param {objectId} idPaciente
     */

    reenviar(idPaciente): Observable<any> {
        return this.server.post(this.mobileUrl + 'v2/reenviar-codigo', { id: idPaciente });
    }

}
