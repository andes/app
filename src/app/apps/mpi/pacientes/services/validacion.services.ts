import { Injectable } from '@angular/core';
import { Auth } from '@andes/auth';
import { Server } from '@andes/shared';

@Injectable()
export class ValidacionService {

    private baseURL = '/core_v2/mpi/validacion';  // URL to web api

    constructor(private server: Server, public auth: Auth) { }
    /**
     * Valida los datos de un paciente con sexo y documento
     * @param paciente Datos del paciente
     */
    validar(paciente) {
        return this.server.post(`${this.baseURL}`, paciente);
    }

}
