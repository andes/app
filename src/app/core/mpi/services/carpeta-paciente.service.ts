import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { ICarpetaPaciente } from '../../../interfaces/ICarpetaPaciente';

@Injectable()
export class CarpetaPacienteService {
    private carpetaUrl = '/modules/carpetas';

    constructor(
        private server: Server) { }

    getNroCarpeta(params: any): Observable<any> {
        return this.server.get(`${this.carpetaUrl}/carpetasPacientes`, { params: params, showError: true });
    }

    getByIdNroCarpeta(id: string): Observable<ICarpetaPaciente> {
        return this.server.get(`${this.carpetaUrl}/carpetasPacientes${id}`, null);
    }

    getSiguienteCarpeta(): Observable<any> {
        return this.server.get(`${this.carpetaUrl}/ultimaCarpeta`);
    }

    incrementarNroCarpeta(): Observable<any> {
        return this.server.post(`${this.carpetaUrl}/incrementarCuenta`, {});
    }
}
