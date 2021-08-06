import { Injectable } from '@angular/core';
import { ResourceBaseHttp, Server, Cache, cacheStorage } from '@andes/shared';
import { ITipoPrestacion } from '../interfaces/ITipoPrestacion';
import { Auth } from '@andes/auth';


@Injectable()
export class ConceptosTurneablesService extends ResourceBaseHttp<ITipoPrestacion> {
    protected url = '/core/tm/conceptos-turneables';
    public static Laboratorio_CDA_ID = '4241000179101';
    public static Vacunas_CDA_ID = '33879002';
    public static VacunacionCovid_ID = '1821000246103';

    constructor(protected server: Server, protected auth: Auth) {
        super(server);
    }

    getByPermisos(permisos?: string) {
        permisos = permisos || undefined;
        return this.search({ permisos }).pipe(
            cacheStorage({
                key: 'conceptos-turneables-' + permisos,
                until: this.auth.session(true)
            })
        );
    }

    @Cache({ key: false })
    getAll() {
        return this.search({});
    }

}
