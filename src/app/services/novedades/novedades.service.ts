import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { environment } from '../../../environments/environment';
import { INovedad } from '../../interfaces/novedades/INovedad.interface';

@Injectable()
export class NovedadesService {

    // URL to web api
    private url = '/modules/registro-novedades';
    private apiUri = environment.API;

    constructor(private server: Server) { }
    get(params): Observable<INovedad[]> { // se obtienen los registros de novedades
        return this.server.get(this.url + `/novedades`, { params, showError: true });
    }
    post(novedad: INovedad): Observable<INovedad> {
        return this.server.post(this.url + '/novedades', novedad);
    }
    patch(novedad): Observable<INovedad> {
        const id = novedad._id;
        return this.server.patch(this.url + `/novedades/${id}`, novedad);
    }
    getUrlImage(id, fileToken) {
        return this.apiUri + this.url + '/store/' + id + '?token=' + fileToken;
    }
}
