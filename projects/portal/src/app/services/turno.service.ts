import { Injectable } from '@angular/core';
import { Server } from '@andes/shared';
import { Observable, BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
    providedIn: 'root',
})

export class TurnoService {

    private agendaUrl = '/modules/mobileApp';

    public tipoPrestacionSubject = new BehaviorSubject(null);
    public profesionalSubject = new BehaviorSubject(null);
    public turnoDadoSubject = new BehaviorSubject(null);
    public turnosFiltrados$ = new Observable<any[]>();
    public filtroProximos = new BehaviorSubject(null);

    constructor(
        private server: Server
    ) {
        this.turnosFiltrados$ = combineLatest(
            this.getTurnos(),
            this.filtroProximos
        ).pipe(
            map(([turnos, mostrarProximos]) => {
                if (mostrarProximos) {
                    return turnos.filter(t => moment(t.horaInicio) > moment());
                }
                return turnos.filter(t => moment(t.horaInicio) < moment());
            })
        );
    }


    getTurnos(): Observable<any[]> {
        return this.server.get(this.agendaUrl + '/turnos');
    }

    getTurno(id: number | string) {
        return this.getTurnos().pipe(
            map((turnos) => turnos.find(turno => turno._id === id)));
    }


}
