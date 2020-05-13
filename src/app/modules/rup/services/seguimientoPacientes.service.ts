import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { Auth } from '@andes/auth';
import { ISeguimientoPaciente } from '../interfaces/seguimientoPaciente.interface';

@Injectable()
export class SeguimientoPacientesService {

    private prestacionesUrl = '/modules/seguimientoPaciente/';  // URL to web api
    constructor(
        private server: Server
        ) { }

        getRegistros(params: any) {
            return this.server.get(this.prestacionesUrl,  {params: params, showError: true});
        }
}
