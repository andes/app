import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subscription, timer, of } from 'rxjs';
import { map, tap, defaultIfEmpty, startWith } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-estado-servicio',
    templateUrl: './estado-servicio.component.html',
    styleUrls: ['./estado-servicio.component.scss'],
})

export class EstadoServicioComponent implements OnInit, OnDestroy {
    fechaActual$: Observable<Date>;
    fecha$: Observable<Date>;
    total: number;
    camasXEstado: any = {};
    camasXEstado$: Observable<any>;

    private sub: Subscription;

    constructor(
        public mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.fecha$ = this.mapaCamasService.fecha2;

        this.fechaActual$ = this.mapaCamasService.fechaActual$.pipe(
            startWith(moment().toDate())
        );

        this.sub = this.mapaCamasService.snapshotFiltrado$.pipe(
            tap((snapshot) => {
                this.total = snapshot.length;
                this.camasXEstado = this.groupBy(snapshot, 'estado');
            })
        ).subscribe();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }


    groupBy(xs: ISnapshot[], key: string) {
        return xs.reduce((rv, x) => {
            (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    setFecha(fecha: Date) {
        this.mapaCamasService.setFecha(fecha);
    }
}
