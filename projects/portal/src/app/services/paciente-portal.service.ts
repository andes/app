import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class PacientePortalService {
    private hudsURl = '/modules/rup/prestaciones/huds/';
    private pacienteV2 = '/modules/mobileApp/paciente';

    constructor(
        private server: Server,
    ) { }

    getById(id: String, options?: any): Observable<any> {
        return this.server.get(`${this.pacienteV2}/${id}`, options);
    }

    getHuds(id, expresionSnomed): Observable<any> {
        return this.server.get(`${this.hudsURl}${id}?expresion=${expresionSnomed}`);
    }
}
