import { Auth } from '@andes/auth';
import { Cache, cacheStorage, ResourceBaseHttp, Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { ITipoPrestacion } from '../interfaces/ITipoPrestacion';


@Injectable()
export class ConceptosTurneablesService extends ResourceBaseHttp<ITipoPrestacion> {
    protected url = '/core/tm/conceptos-turneables';
    public static Laboratorio_CDA_ID = '4241000179101';
    public static Laboratorio_SISA_CDA_ID = '3031000246109';
    public static Vacunas_CDA_ID = '33879002';
    public static VacunacionCovid_ID = '1821000246103';

    constructor(protected server: Server, protected auth: Auth) {
        super(server);
    }

    getByPermisos(permisos?: string, ambito?: string) {
        permisos = permisos || null;
        ambito = ambito || null;
        return this.search({ permisos, ambito }).pipe(
            cacheStorage({
                key: 'conceptos-turneables-' + permisos + ambito,
                until: this.auth.session(true)
            })
        );
    }

    @Cache({ key: false })
    getAll() {
        return this.search({});
    }

}
