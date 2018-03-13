import * as https from 'https';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { Server } from '@andes/shared';


@Injectable()
export class SugerenciasService {
    private sugerenciasUrl = '/modules/sugerencias/';  // URL to web api

    constructor(private server: Server) { }

    post(datos: any): Observable<any> {
        return this.server.post(this.sugerenciasUrl, datos);
    }
}