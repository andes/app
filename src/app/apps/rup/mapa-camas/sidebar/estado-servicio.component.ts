import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../services/mapa-camas.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ISnapshot } from '../interfaces/ISnapshot';

@Component({
    selector: 'app-estado-servicio',
    templateUrl: './estado-servicio.component.html',
    styleUrls: ['./estado-servicio.component.scss'],
})

export class EstadoServicioComponent implements OnInit {
    fecha: Date = moment().toDate();
    fechaHasta: Date = moment().toDate();
    total: number;
    camasXEstado: any;
    camasXEstado$: Observable<any>;
    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.mapaCamasService.snapshotFiltrado$.pipe(
            map((snapshot) => {
                this.total = snapshot.length;
                this.camasXEstado = this.groupBy(snapshot, 'estado');
            })
        ).subscribe();
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
