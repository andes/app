import { Server } from '@andes/shared';
import { IInstitucion } from './../../interfaces/turnos/IInstitucion';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class InstitucionService {
    private institucionUrl = '/modules/turnos/institucion';  // URL to web api
    constructor(private server: Server) { }

    get(params): Observable<IInstitucion[]> {
        return this.server.get(this.institucionUrl, { params: params, showError: true });
    }

    post(institucion): Observable<IInstitucion> {
        return this.server.post(this.institucionUrl + '/institucion/', institucion);
    }

    patch(id, cambios: any, options: any = {}): Observable<IInstitucion> {
        return this.server.patch(this.institucionUrl + '/institucion/' + `${id}`, cambios);
    }

    delete(institcion: IInstitucion): Observable<any> {
        return this.server.delete(this.institucionUrl + '/institucion/' + `${institcion.id}`);
    }
}
