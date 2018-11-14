import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';

@Injectable()
export class LogPacienteService {

    private logUrl = '/core/log/paciente';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.logUrl, { params: params, showError: true });
    }

}
