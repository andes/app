import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';

@Injectable()
export class SeguimientoPacientesService{

    private prestacionesUrl = '/modules/seguimientoPaciente/registros';  // URL to web api
    constructor(
        private server: Server
        ) { }
    /**
     *
     * @param params.sexo id devuelto por el metodo post.
     * @param params.paciente estado para filtrar.
     */
        getRegistros(params: any) {
            return this.server.get(this.prestacionesUrl, { params });
        }
}