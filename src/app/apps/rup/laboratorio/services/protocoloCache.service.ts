import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';

Injectable();
export class ProtocoloCacheService {

    private contextoCache = new BehaviorSubject<any>({titulo: 'carga', modo: 'carga'});

    setContextoCache(prestacion: any) {
        this.contextoCache.next(prestacion);
    }

    getContextoCache(): Observable<any> {
        return (this.contextoCache.asObservable().source as any)._value;
    }
}



