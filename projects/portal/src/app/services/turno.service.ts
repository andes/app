import { Injectable } from '@angular/core';
import { cacheStorage, Server } from '@andes/shared';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth } from '@andes/auth';
@Injectable({
    providedIn: 'root',
})

export class TurnoService {

    private agendaUrl = '/modules/mobileApp';

    constructor(
        private server: Server,
        private auth: Auth
    ) { }


    getTurnos(): Observable<any[]> {
        return this.server.get(this.agendaUrl + '/turnos').pipe(
            cacheStorage({ key: 'turnos', ttl: 60 * 24 })
        );
    }

    getTurno(id: number | string) {
        return this.getTurnos().pipe(
            map((turnos) => turnos.find(turno => turno._id === id)));
    }


}
