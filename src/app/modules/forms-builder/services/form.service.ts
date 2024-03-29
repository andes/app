import { ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';

export interface Form {
    name: string;
    type: string;
    description: string;
    snomedCode: string;
    config: {
        idEvento: string;
        idGrupoEvento: string;
        configField: [{
            key: string;
            value: string;
            event: string;
        }];
    };
    active: boolean;
    sections: {
        id: string;
        active: boolean;
        name: string;
        type: string;
        fields: {
            key: string;
            label: string;
            type: string;
            description: string;
            items: any;
            snomedCodeOrQuery: string;
            required: boolean;
            subfilter: boolean;
            extras: any;
            resources: string;
            preload: boolean;
        }[];
    }[];
}

@Injectable({ providedIn: 'root' })
export class FormsService extends ResourceBaseHttp<Form> {
    protected url = '/modules/forms/formulario';

    constructor(protected server: Server) {
        super(server);
    }
}
