import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../environments/environment';
import * as io from 'socket.io-client';
import { WebSocketService } from './websocket.serivice';

@Injectable()
export class TurneroService {

    private turneroUrl = '/modules/turnero/';  // URL to web api

    constructor(
        private server: Server,
        private ws: WebSocketService
    ) { }


    llamar(turno) {
        this.ws.emit('turnero-proximo-llamado', turno);
    }

    get(params: any): Observable<any> {
        return this.server.get(this.turneroUrl + 'pantalla', { params: params, showError: true });
    }

}
