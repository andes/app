import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';

@Injectable()
export class TipoTrasladoService extends ResourceBaseHttp {
    protected url = '/modules/com/tipoTraslado';
    constructor(protected server: Server) {
        super(server);
    }
}
