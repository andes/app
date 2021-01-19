import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

export interface Form {
    name: string;
    type: string;
    active: boolean;
    fields: {
        key: string;
        label: string;
        type: string;
        description: string;
        required: boolean;
        subfilter: boolean;
        extras: any;
        resources: string;
        preload: boolean;
    }[];
}

@Injectable({ providedIn: 'root' })
export class FormsService extends ResourceBaseHttp<Form> {
    protected url = '/modules/forms/formulario';

    constructor(protected server: Server) {
        super(server);
    }
}
