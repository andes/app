import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ZonaSanitariaService extends ResourceBaseHttp {
    protected url = '/core/tm/zonasSantiarias';

    constructor(protected server: Server) {
        super(server);
    }
}
