import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class PacientePortalService {
    private hudsURl = '/modules/rup/prestaciones/huds/';

    constructor(
        private server: Server,
    ) { }

    getHuds(id, expresionSnomed): Observable<any> {
        return this.server.get(`${this.hudsURl}${id}?expresion=${expresionSnomed}`);
    }
}
