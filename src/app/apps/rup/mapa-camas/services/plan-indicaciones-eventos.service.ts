import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable()
export class PlanIndicacionesEventosServices extends ResourceBaseHttp {
    protected url = '/modules/rup/internacion/plan-indicaciones-eventos';
    constructor(protected server: Server) {
        super(server);
    }
}
