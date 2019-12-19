import { Server } from '@andes/shared';
import { IInstitucion } from './../../interfaces/turnos/IInstitucion';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';

@Injectable()
export class InstitucionService {
    private institucionUrl = '/modules/turnos/institucion';  // URL to web api
    constructor(private server: Server) { }

    get(nombre): Observable<IInstitucion[]> {
        return this.server.get(this.institucionUrl + `?nombre=${nombre}`);
    }
}
