import { Constantes } from './../controllers/constants';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

Injectable();
export class ProtocoloCacheService {

    private contextoCache = new BehaviorSubject<any>({titulo: null, modo: null});

    setContextoCache(prestacion: any) {
        this.contextoCache.next(prestacion);
    }

    getContextoCache(): any {
        return (this.contextoCache.asObservable().source as any)._value;
    }

    cambiarModo (modoId) {
        if (modoId === Constantes.modoIds.recepcion) {
            this.getContextoCache().modo = 'recepcion';
            this.getContextoCache().titulo = Constantes.titulos.recepcion;
        } else if (modoId === Constantes.modoIds.recepcionSinTurno) {
            this.getContextoCache().modo = 'recepcion';
            this.getContextoCache().titulo = Constantes.titulos.recepcionSinTurno;
        } else if (modoId === Constantes.modoIds.control) {
            this.getContextoCache().modo = 'control';
            this.getContextoCache().titulo = Constantes.titulos.control;
        } else if (modoId === Constantes.modoIds.carga) {
            this.getContextoCache().titulo = Constantes.titulos.carga;
            this.getContextoCache().modo = 'carga';
        } else if (modoId === Constantes.modoIds.validacion) {
            this.getContextoCache().titulo = Constantes.titulos.validacion;
            this.getContextoCache().modo = 'validacion';
        } else if (modoId === Constantes.modoIds.listado) {
            this.getContextoCache().titulo = Constantes.titulos.listado;
            this.getContextoCache().modo = 'listado';
        }
    }
}



