import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PacientesVacunasService extends ResourceBaseHttp {
    protected url = '/modules/vacunas/vacunas-pacientes';

    constructor(protected server: Server) {
        super(server);
    }
}
