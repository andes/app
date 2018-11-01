import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { IAgenda } from '../../interfaces/turnos/IAgenda';

Injectable();
export class AgendaCacheService {

    private agendaCache = new BehaviorSubject<any>(null);

    setAgenda(agenda: IAgenda) {
        this.agendaCache.next(agenda);
    }

    getAgenda(): Observable<any> {
        return this.agendaCache.asObservable();
    }

    clearAgenda() {
        this.agendaCache.next(null);
    }
}
