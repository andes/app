import { Server } from '@andes/shared';
import { ISectores } from './../interfaces/IOrganizacion';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class SectoresService {
    private organizacionUrl = '/core/tm/organizaciones'; // URL to web api
    constructor(public server: Server) { }

    getSectores(idOrganizacion: string): Observable<any> {
        return this.server.get(this.organizacionUrl + '/' + idOrganizacion + '/sectores', null);
    }

    postSector(idOrganizacion: string, sector: ISectores, padre = null) {
        return this.server.post(this.organizacionUrl + '/' + idOrganizacion + '/sectores/', { sector, padre });
    }

    patchSector(idOrganizacion: string, sector: ISectores): Observable<any> {
        return this.server.patch(this.organizacionUrl + '/' + idOrganizacion + '/sectores/' + sector.id, { sector });
    }

    deleteSector(idOrganizacion: string, idSector: string): Observable<any> {
        return this.server.delete(this.organizacionUrl + '/' + idOrganizacion + '/sectores/' + idSector, null);
    }
}
