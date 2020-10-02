import { Injectable } from '@angular/core';
import { Server, ResourceBaseHttp } from '@andes/shared';

@Injectable()
export class ReglasDerivacionService extends ResourceBaseHttp {
    protected url = '/modules/com/reglasDerivacion';
    constructor(protected server: Server) { super(server); }
}
