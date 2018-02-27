import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';


@Injectable()
export class AgendaService {
    private turnoUrl = '/modules/turnos/agenda';

    constructor(private server: Server) { }

    getTurnos(params: any): Observable<any[]> {
        return this.server.get(this.turnoUrl + '/turno', { params: params, showError: true });
    }
}