import { PacienteService } from '../../core/mpi/services/paciente.service';
import * as https from 'https';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';


@Injectable()
export class SintysService {

    private sintysUrl = '/modules/fuentesAutenticas';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<any> {
        return this.server.get(this.sintysUrl + '/sintys', { params: params, showError: true });
    }

}
