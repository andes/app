import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Auth } from '@andes/auth';
@Injectable({
    providedIn: 'root',
})

export class TurnoService {

    private agendaUrl = '/modules/mobileApp';

    public tipoPrestacionSubject = new BehaviorSubject(null);
    public profesionalSubject = new BehaviorSubject(null);
    public turnoDadoSubject = new BehaviorSubject(null);

    constructor(
        private server: Server,
        private auth: Auth
    ) { }


    getTurnos(): Observable<any[]> {
        return this.server.get(this.agendaUrl + '/turnos');
    }

    getTurno(id: number | string) {
        return this.getTurnos().pipe(
            map((turnos) => turnos.find(turno => turno._id === id)));
    }


}
