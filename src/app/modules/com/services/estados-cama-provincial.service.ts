import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { auditTime, map, switchMap } from 'rxjs/operators';
import { MapaCamasHTTP } from 'src/app/apps/rup/mapa-camas/services/mapa-camas.http';

@Injectable()

export class EstadosCamaProvincialService {

    public camasEstados$: Observable<any[]>;
    public organizacion = new BehaviorSubject<any>(null);
    public unidadOrganizativa = new BehaviorSubject<any>(null);
    public fecha = new BehaviorSubject<Date>(new Date());

    constructor(
        private mapaCamasHTTP: MapaCamasHTTP,
    ) {
        this.camasEstados$ = combineLatest([
            this.organizacion,
            this.unidadOrganizativa,
            this.fecha
        ]).pipe(
            auditTime(0),
            switchMap(([organizacion, unidadOrganizativa, fecha]) =>
                this.mapaCamasHTTP.estadosCamas(
                    organizacion,
                    unidadOrganizativa,
                    'internacion',
                    'medica',
                    fecha
                ).pipe(
                    map((resumen) => {
                        return (resumen && resumen.length) ? resumen : [];
                    })
                )
            )
        );
    }
}
