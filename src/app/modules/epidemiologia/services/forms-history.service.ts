import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormsHistoryService extends ResourceBaseHttp {
    protected url = '/modules/forms/forms-epidemiologia/formsHistory';

    constructor(protected server: Server) {
        super(server);
    }
}
