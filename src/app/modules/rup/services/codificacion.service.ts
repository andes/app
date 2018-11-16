import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ICodificacionPrestacion } from '../interfaces/ICodificacion';

@Injectable()
export class CodificacionService {
    private codificacionUrl = '/modules/rup/codificacion/';  // URL to web api
    constructor(private server: Server) { }

    addCodificacion(idPrestacion: String): Observable<ICodificacionPrestacion> {
        return this.server.post(this.codificacionUrl, { idPrestacion: idPrestacion });
    }
}
