import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class ResumenPacienteDinamicoService {

    private resumenURL = '/modules/rup/prestaciones';  // URL to web api

    constructor(private server: Server) { }

    get(idPaciente: String, params): Observable<any[]> {
        return this.server.get(this.resumenURL + '/resumenPaciente/' + idPaciente, { params: params, showError: true });
    }
}
