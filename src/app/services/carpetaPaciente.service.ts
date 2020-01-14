import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { ICarpetaPaciente } from '../interfaces/ICarpetaPaciente';

@Injectable()
export class CarpetaPacientesService {

    private baseURL = '/modules/carpetas';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }

    /**
     * Recupera un listado de paciente según los filtros aplicados
     * @param params Filtros de busqueda
     */

    get(params) {
        return this.server.get(this.baseURL, { params });
    }

    getNroCarpeta(params: any): Observable<any> {
        return this.server.get(`${this.baseURL}/carpetasPacientes`, { params: params, showError: true });
    }

    getByIdNroCarpeta(id: String): Observable<ICarpetaPaciente> {
        return this.server.get(`${this.baseURL}/carpetasPacientes${id}`, null);
    }

    getSiguienteCarpeta(): Observable<any> {
        return this.server.get(`${this.baseURL}/ultimaCarpeta`);
    }

    incrementarNroCarpeta(): Observable<any> {
        return this.server.post(`${this.baseURL}/incrementarCuenta`, {});
    }

}
