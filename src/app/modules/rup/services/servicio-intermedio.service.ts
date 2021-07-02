import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ServicioIntermedioService extends ResourceBaseHttp {
    protected url = '/core/tm/servicios-intermedio';
    constructor(protected server: Server) {
        super(server);
    }
}
