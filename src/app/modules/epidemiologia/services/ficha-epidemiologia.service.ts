import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormsEpidemiologiaService extends ResourceBaseHttp {
    protected url = '/modules/forms/forms-epidemiologia/formEpidemiologia';

    constructor(protected server: Server) {
        super(server);
    }
}
