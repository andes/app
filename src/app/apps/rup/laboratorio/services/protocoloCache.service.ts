import { IPrestacion } from './../../../../interfaces/turnos/IPrestacion';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

Injectable();
export class ProtocoloCacheService {

    private protocoloCache = new BehaviorSubject<any>(null);

    setPrestacion(prestacion: IPrestacion) {
        this.protocoloCache.next(prestacion);
    }

    getPrestacion(): Observable<any> {
        return this.protocoloCache.asObservable();
    }

    clearAgenda() {
        this.protocoloCache.next(null);
    }
}



