import { Injectable } from '@angular/core';
import { Server, Cache } from '@andes/shared';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { Auth } from '@andes/auth';

@Injectable({
    providedIn: 'root',
})

export class PacientePortalService {
    private mobileUrl = '/modules/mobileApp';

    constructor(
        private server: Server,
        private auth: Auth
    ) { }

    @Cache({ key: null })
    me(): Observable<IPaciente> {
        return this.getById(this.auth.mobileUser.pacientes[0].id);
    }

    getById(id: String, options?: any): Observable<any> {
        return this.server.get(`${this.mobileUrl}/paciente/${id}`, options);
    }

    getHuds(id, expresionSnomed, valor = true): Observable<any> {
        const params = {
            expresion: expresionSnomed,
            valor
        };
        return this.server.get(`${this.mobileUrl}/prestaciones/huds/${id}`, { params });
    }

    getFamiliar(id: String, options?: any): Observable<IPaciente> {
        return this.server.get(`${this.mobileUrl}/paciente/${id}/relaciones`, options);
    }

    registro(paciente) {
        return this.server.post(`${this.mobileUrl}/registro`, paciente);
    }
}
