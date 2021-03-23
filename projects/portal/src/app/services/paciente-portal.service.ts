import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';

@Injectable({
    providedIn: 'root',
})

export class PacientePortalService {
    private mobileUrl = '/modules/mobileApp';

    constructor(
        private server: Server
    ) { }

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
}
