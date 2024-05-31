import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
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
        return this.server.get(`${this.mobileUrl}/laboratorios/${id}`).pipe(
            cacheStorage({ key: 'laboratorios' })
        );
    }

    getLaboratorio(id: number | string, idPaciente) {
        return this.getLaboratorios(idPaciente).pipe(
            map((laboratorios) => laboratorios.find(laboratorio => laboratorio.cda_id === id))
        );
    }

    getProtocolos({ estado, dni, fecNac, apellido, fechaDde, fechaHta }) {
        return this.server.get(`/modules/rup/protocolosLab?estado=${estado}&dni=${dni}&fecNac=${fecNac}&apellido=${apellido}&fechaDde=${fechaDde}&fechaHta=${fechaHta}`);
    }

    getByProtocolo(id: number) {
        return this.server.get(`/modules/rup/protocolosLab/${id}`);
    }

    descargar(cda) {
        if (cda.confidentialityCode !== 'R') {
            const url = environment.API + '/modules/cda/' + cda.adjuntos[0] + '?token=' + this.auth.getToken();
            window.open(url);
        }
    }
}
