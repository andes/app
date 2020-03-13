import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { IModulo } from '../../interfaces/novedades/IModulo.interface';

@Injectable()
export class ModulosService {

    // URL to web api
    private url = '/modules/registro-novedades';

    constructor(private server: Server) { }
    get(params): Observable<IModulo[]> { // se obtienen los registros de novedades
        return this.server.get(this.url + `/modulos`, { params, showError: true });
    }

    post(modulo: IModulo): Observable<IModulo[]> {
        return this.server.post(this.url + `/modulos`, { modulo, showError: true });
    }

    patch(modulo: IModulo): Observable<IModulo> {
        const id = modulo._id;
        return this.server.patch(this.url + `/modulos/${id}`, modulo);
    }
}
