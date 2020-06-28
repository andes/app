import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';

@Injectable()
export class ModulosService extends ResourceBaseHttp {
    protected url = '/core/tm/modulos_new';
    constructor(protected server: Server) { super(server); }
}
