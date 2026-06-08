import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';

@Injectable()
export class EstrategiaAtencionService extends ResourceBaseHttp {
    protected url = '/modules/com/estrategiaAtencion';
    constructor(protected server: Server) {
        super(server);
    }
}
