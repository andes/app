import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs/Rx';
import { environment } from '../../environments/environment';
import { IBarrio } from './../interfaces/IBarrio';

@Injectable()
export class BarrioService {

     private barrioUrl = '/core/tm/barrios';  // URL to web api

    constructor(private server: Server) { }

    get(params: any): Observable<IBarrio[]> {
        return this.server.get(this.barrioUrl, { params: params, showError: true });
    }

    getXLocalidad(localidad: String): Observable<IBarrio[]> {
        return this.server.get(this.barrioUrl + '?localidad=' + localidad);
    }
}
