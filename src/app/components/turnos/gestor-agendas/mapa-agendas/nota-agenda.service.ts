import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class NotaAgendaService extends ResourceBaseHttp {
    protected url = '/modules/turnos/notas-agenda';
    constructor(protected server: Server) { super(server); }
}
