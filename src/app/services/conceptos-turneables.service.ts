import { Injectable } from '@angular/core';
import { ResourceBaseHttp, Server } from '@andes/shared';
import { ITipoPrestacion } from '../interfaces/ITipoPrestacion';

@Injectable()
export class ConceptosTurneablesService extends ResourceBaseHttp<ITipoPrestacion> {
    protected url = '/core/tm/conceptos-turneables';

    constructor(protected server: Server) {
        super(server);
    }
}
