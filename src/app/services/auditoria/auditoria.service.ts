
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
// Import RxJs required methods


import { Server } from '@andes/shared';
import { IAudit } from '../../interfaces/auditoria/IAudit';
// import { AppSettings } from '../utils/appSettings';
@Injectable()
export class AuditoriaService {

    private auditoriaURL = '/core/mpi/auditoria/matching';

    constructor(private server: Server) { }

    get(): Observable<IAudit[]> {
        return this.server.get(this.auditoriaURL);
    }

    patch(id: String, cambios: any): Observable<any> {
        return this.server.patch(this.auditoriaURL + '/' + id, cambios);
    }

    put(paciente: any): Observable<any> {
        return this.server.put(this.auditoriaURL + '/' + paciente.id, paciente);
    }

}
