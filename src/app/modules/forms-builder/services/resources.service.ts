import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
export interface FormResources {
    id: string;
    nombre: string;
    key: string;
    activo: boolean;
}
@Injectable({ providedIn: 'root' })
export class FormResourcesService extends ResourceBaseHttp<Event> {
    protected url = '/modules/forms/form-resources/resources';

    constructor(protected server: Server) {
        super(server);
    }
}
