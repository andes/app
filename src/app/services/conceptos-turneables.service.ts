import { Injectable } from '@angular/core';
import { ResourceBaseHttp, Server, Cache, cacheStorage } from '@andes/shared';
import { ITipoPrestacion } from '../interfaces/ITipoPrestacion';
import { Auth } from '@andes/auth';


@Injectable()
export class ConceptosTurneablesService extends ResourceBaseHttp<ITipoPrestacion> {
    protected url = '/core/tm/conceptos-turneables';

    constructor(protected server: Server, protected auth: Auth) {
        super(server);
    }

    getByPermisos(permisos?: string) {
        permisos = permisos || undefined;
        return this.search({ permisos }).pipe(
            cacheStorage(
                'conceptos-turneables-' + permisos,
                this.auth.session(true)
            )
        );
    }

    @Cache({ key: false })
    getAll() {
        return this.search({});
    }

}
