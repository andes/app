import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
export interface FormResources {
    name: string;
    id: string;
    type: string;
    activo: boolean;
}
@Injectable({ providedIn: 'root' })
export class FormResourcesService extends ResourceBaseHttp<Event> {
    protected url = '/modules/forms/form-resources/resources';

    constructor(protected server: Server) {
        super(server);
    }
}
