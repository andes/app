import { PacienteService } from '../paciente.service';
import * as https from 'https';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';
import { IPaciente } from '../../interfaces/IPaciente';

@Injectable()
export class SisaService {

    private sisaUrl = '/modules/fuentesAutenticas';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/validar', { params: params, showError: true });
    }

}
