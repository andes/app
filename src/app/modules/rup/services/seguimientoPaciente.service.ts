import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';

@Injectable()
export class SeguimientoPacienteService {

    private prestacionesUrl = '/modules/seguimiento-paciente/';  // URL to web api
    constructor(
        private server: Server
        ) { }

        getRegistros(params: any) {
            return this.server.get(this.prestacionesUrl,  {params: params, showError: true});
        }
}
