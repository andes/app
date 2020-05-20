import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';
import { environment } from '../../../environments/environment';

@Injectable()
export class NovedadesService extends ResourceBaseHttp {

    protected url = '/modules/registro-novedades/novedades';
    private apiUri = environment.API;

    constructor(protected server: Server) { super(server); }

    getUrlImage(id, fileToken) {
        return this.apiUri + '/modules/registro-novedades/store/' + id + '?token=' + fileToken;
    }
}

