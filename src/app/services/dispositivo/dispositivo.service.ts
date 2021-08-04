import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable()
export class DispositivoService extends ResourceBaseHttp {
    protected url = '/modules/dispositivo';
    constructor(protected server: Server) {
        super(server);
    }
}
