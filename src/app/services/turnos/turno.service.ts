import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class TurnoService {
    private turnoUrl = '/modules/turnos';  // URL to web api

    constructor(private server: Server) { }
    save(turno: any): Observable<any> {
        if (turno.idAgenda) {
            return this.server.patch(this.turnoUrl + '/agenda/' + turno.idAgenda + '/bloque/' + turno.idBloque  + '/turno/' + turno.idTurno , turno);
        }
    }
}
