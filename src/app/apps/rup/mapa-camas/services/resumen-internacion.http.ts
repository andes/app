import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InternacionResumenHTTP extends ResourceBaseHttp {
    protected url = '/modules/rup/internacion/internacion-resumen';

    constructor(protected server: Server) {
        super(server);
    }

}
