import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';

@Injectable()
export class GrupoPoblacionalService extends ResourceBaseHttp {
    protected url = '/core/tm/grupo-poblacional';
    constructor(protected server: Server) { super(server); }
}
