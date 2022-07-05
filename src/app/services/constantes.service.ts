import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })

export class ConstantesService extends ResourceBaseHttp {
    protected url = '/modules/constantes';

    constructor(protected server: Server) {
        super(server);
    }
}
