import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-estado-servicio',
    templateUrl: './estado-servicio.component.html',
    styleUrls: ['./estado-servicio.component.scss'],
})

export class EstadoServicioComponent implements OnInit, OnDestroy {
    fecha: Date = moment().toDate();
    fechaHasta: Date = moment().toDate();
    total: number;
    camasXEstado: any = {};
    camasXEstado$: Observable<any>;

    private sub: Subscription;

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
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

    setFecha() {
        this.mapaCamasService.setFecha(this.fecha);
    }
}
