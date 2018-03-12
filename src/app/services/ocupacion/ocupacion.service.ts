import { Server } from '@andes/shared';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';

@Injectable()
export class OcupacionService {
    private ocupacionUrl = '/core/tm/ocupacion';  // URL to web api
    constructor(private server: Server) { }

    /**
     * Metodo get. Trae todos  los objetos ocupacion.
     */
    get(): Observable<any[]> {
        return this.server.get(this.ocupacionUrl);
    }

}
