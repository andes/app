import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IRegistroNovedades } from '../../interfaces/novedades/IRegistroNovedades.interface';
import { IModuloAndes } from '../../interfaces/novedades/IModuloAndes.interface';
import { environment } from '../../../environments/environment';

@Injectable()
export class RegistroNovedadesService {

    // URL to web api
    private url = '/modules/registro-novedades';
    private apiUri = environment.API;

    constructor(private server: Server) { }
    getAll(params): Observable<IRegistroNovedades[]> { // se obtienen los registros de novedades
        return this.server.get(this.url + `/novedades`, { params, showError: true });
    }

    postNuevoRegistro(newregNov: IRegistroNovedades): Observable<IRegistroNovedades[]> {
        return this.server.post(this.url + `/novedades`, { newregNov, showError: true });
    }
    patch(editNov: IRegistroNovedades): Observable<IRegistroNovedades> {
        const id = editNov._id;
        return this.server.patch(this.url + `/novedades/${id}`, editNov);
    }
    getAllModulos(): Observable<IModuloAndes[]> { // se obtienen todos los módulos de Andes
        return this.server.get(this.url + `/modulo_andes`, { showError: true });
    }
}
