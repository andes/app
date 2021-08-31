import { Injectable } from '@angular/core';
import { ISalaComun } from '../../interfaces/ISalaComun';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IOrganizacion } from '../../../../../interfaces/IOrganizacion';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Injectable()
export class SalaComunService {
    private url = '/modules/rup/internacion';

    constructor(
        private server: Server

    ) { }

    get(idSala: string): Observable<ISalaComun> {
        return this.server.get(`${this.url}/sala-comun/${idSala}`);
    }

    save(organizacion: IOrganizacion, salaComun: ISalaComun): Observable<ISalaComun> {
        if (salaComun.id) {
            return this.server.patch(`${this.url}/sala-comun/${salaComun.id}`, { ...salaComun, organizacion });
        } else {
            return this.server.post(`${this.url}/sala-comun`, { ...salaComun, organizacion });
        }
    }

    ingresarPaciente(salaComun: ISnapshot, fecha: Date): Observable<ISnapshot> {
        return this.server.post(`${this.url}/sala-comun/${salaComun.id}/patients`, { ...salaComun, fecha });
    }

    egresarPaciente(salaComun: ISnapshot, fecha: Date): Observable<ISnapshot> {
        return this.server.patch(`${this.url}/sala-comun/${salaComun.id}/patients`, { ...salaComun, fecha });
    }
}
