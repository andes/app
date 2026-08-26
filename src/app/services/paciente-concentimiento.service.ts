import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PacientesConsentimientoService extends ResourceBaseHttp {
    protected url = '/core/tm/consentimiento';

    constructor(protected server: Server) {
        super(server);
    }
}
