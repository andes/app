import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { IMotivosHuds } from '../interfaces/IMotivosHuds';

@Injectable()
export class MotivosHudsService {

    private motivosHudsUrl = '/modules/huds/motivosHuds/motivosHuds?moduloDefault='; // URL to web api http://localhost:3002/api/modules/huds/motivosHuds/motivosHuds

    constructor(private server: Server) { }

    getMotivosModal(): Observable<IMotivosHuds[]> {
        return this.server.get(this.motivosHudsUrl + 'seleccion-manual');
    }
    getMotivo(modulo: string): Observable<IMotivosHuds[]> {
        return this.server.get(this.motivosHudsUrl + modulo);
    }
}
