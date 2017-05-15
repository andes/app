import { Server } from '@andes/shared';
import { IAuditoriaPrestacionPaciente } from './../../interfaces/auditoria/IAuditoriaPrestacionPaciente';
import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuditoriaPrestacionPacienteService {
    private auditoriaURL = '/modules/auditorias/prestacionPaciente';  // URL to web api
    constructor(private server: Server) { }

    get(params: any): Observable<IAuditoriaPrestacionPaciente[]> {
        return this.server.get(this.auditoriaURL, {params: params, showError: true});
    }

    /**
     * Metodo getById. Trae el objeto LlaveTipoPrestacion por su Id.
     * @param {String} id Busca por Id
     */
    getById(id: String): Observable<IAuditoriaPrestacionPaciente> {
        return this.server.get(this.auditoriaURL + '/' + id, null)
    }

    post(llaveTP: IAuditoriaPrestacionPaciente): Observable<IAuditoriaPrestacionPaciente> {
        return this.server.post(this.auditoriaURL, llaveTP);
    }

    put(llaveTP: IAuditoriaPrestacionPaciente): Observable<IAuditoriaPrestacionPaciente> {
        return this.server.put(this.auditoriaURL + '/' + llaveTP.id, llaveTP);
    }

    patch(id: String, cambios: any): Observable<IAuditoriaPrestacionPaciente> {
        return this.server.patch(this.auditoriaURL + '/' + id, cambios);
    }
}
