import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FormPresetResourcesService extends ResourceBaseHttp<Event> {
    protected url = '/modules/forms/form-resources/preset-resources';

    constructor(protected server: Server) {
        super(server);
    }
}
