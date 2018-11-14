import { IAgenda } from './../../interfaces/turnos/IAgenda';
import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class FormTerapeuticoService {

    // URL to web api
    private formTerapeuticoUrl = '/core/tm/formularioTerapeutico';

    constructor(private server: Server) { }


    get(params) {
        return this.server.get(this.formTerapeuticoUrl + '/formularioTerapeutico', {params: params});
    }

    put(data) {
        return this.server.put(this.formTerapeuticoUrl + '/' + data._id,  data);
    }


    post(data) {
        return this.server.post(this.formTerapeuticoUrl,  data);
    }


}
