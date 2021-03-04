import { Injectable } from '@angular/core';
import { Agenda } from '../modelos/agenda';
import { AGENDAS } from '../mock-data/mock-agendas';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()

export class AgendaService {

    constructor() {
    }

    getAgendas(): Observable<Agenda[]> {
        return of(AGENDAS);
    }

    getAgenda(id: number | string) {
        return this.getAgendas().pipe(
            map((agendas: Agenda[]) => agendas.find(agenda => agenda.id === +id))
        );
    }
}
