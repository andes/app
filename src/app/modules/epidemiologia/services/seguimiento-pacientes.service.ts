import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SeguimientoPacientesService extends ResourceBaseHttp {
    protected url = '/modules/seguimiento-paciente/seguimientoPaciente';

    constructor(protected server: Server) {
        super(server);
    }

    asignarProfesional(data) {
        return this.server.post(`${this.url}/asignaciones`, data);
    }
}
