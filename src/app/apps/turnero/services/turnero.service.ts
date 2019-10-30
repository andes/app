import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { WebSocketService } from '../../../services/websocket.service';

@Injectable()
export class TurneroService {

    private turneroUrl = '/modules/turnero/';  // URL to web api

    constructor(
        private server: Server,
        private ws: WebSocketService
    ) { }


    llamar(agenda, turno) {
        let turnoProximo = {
            id: turno.id,
            horaInicio: turno.horaInicio,
            paciente: turno.paciente,
            horaLlamada: new Date(),
            profesional: agenda.profesionales[0],
            tipoPrestacion: turno.tipoPrestacion,
            espacioFisico: agenda.espacioFisico
        };
        this.ws.emit('turnero-proximo-llamado', turnoProximo);
    }

    get(params: any): Observable<any> {
        return this.server.get(this.turneroUrl + 'pantalla', { params: params, showError: true });
    }

}
