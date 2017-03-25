import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { IBarrio } from './../interfaces/IBarrio';

@Injectable()
export class BarrioService {
    private barrioUrl = '/barrios';  // URL to web api

    constructor(private server: Server) { }

    get(): Observable<IBarrio[]> {
        return this.server.get(this.barrioUrl);
    }

    getXProvincia(localidad: String): Observable<IBarrio[]> {
        return this.server.get(this.barrioUrl + '?localidad=' + localidad);
    }
}
