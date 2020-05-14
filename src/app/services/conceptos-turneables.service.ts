import { Injectable } from '@angular/core';
import { ResourceBaseHttp, Server, Cache } from '@andes/shared';
import { ITipoPrestacion } from '../interfaces/ITipoPrestacion';

@Injectable()
export class ConceptosTurneablesService extends ResourceBaseHttp<ITipoPrestacion> {
    protected url = '/core/tm/conceptos-turneables';

    constructor(protected server: Server) {
        super(server);
    }

    @Cache({ key: true })
    getByPermisos(permisos?: string) {
        // para evitar que se envie por la red si es null
        permisos = permisos || undefined;
        return this.search({ permisos });
    }
}
