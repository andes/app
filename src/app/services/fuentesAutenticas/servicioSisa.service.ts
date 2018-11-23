import { PacienteService } from '../paciente.service';
import * as https from 'https';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Server } from '@andes/shared';
import { IPaciente } from '../../interfaces/IPaciente';

@Injectable()
export class SisaService {

    private sisaUrl = '/modules/fuentesAutenticas';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/sisa', { params: params, showError: true });
    }

    getPaciente(params: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/pacienteSisa', { params: params, showError: true });
    }

    getPuco(dni: any): Observable<any> {
        return this.server.get(this.sisaUrl + '/puco/' + dni);
    }
}
