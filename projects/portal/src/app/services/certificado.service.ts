import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Auth } from '@andes/auth';
@Injectable({
    providedIn: 'root',
})

export class LaboratorioService {
    private mobileUrl = '/modules/mobileApp/';

    constructor(
        private server: Server,
        private auth: Auth
    ) { }

    getLaboratorios(id): Observable<any[]> {
        return this.server.get(`${this.mobileUrl}/laboratorios/${id}`);

    }

    getLaboratorio(id: number | string, idPaciente) {
        return this.getLaboratorios(idPaciente).pipe(
            map((laboratorios) => laboratorios.find(laboratorio => laboratorio.cda_id === id))
        );
    }

    descargar(cda) {
        if (cda.confidentialityCode !== 'R') {
            const url = environment.API + '/modules/cda/' + cda.adjuntos[0] + '?token=' + this.auth.getToken();
            window.open(url);
        }
    }

}
