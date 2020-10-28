import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import * as moment from 'moment';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit {
    public historial = new Subject();

    public historial$: Observable<any>;

    public desde = moment(this.mapaCamasService.fecha).subtract(7, 'd').toDate();
    public hasta = this.mapaCamasService.fecha;

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.onChange();

        const fechaPipe = this.historial.pipe(
            startWith({
                desde: this.desde, hasta: this.hasta
            }),
            map((filtros: any) => {
                return {
                    desde: moment(filtros.desde).startOf('day').toDate(),
                    hasta: moment(filtros.hasta).endOf('day').toDate(),
                };
            })
        );

        this.historial$ = combineLatest(
            this.mapaCamasService.historialInternacion$,
            fechaPipe
        ).pipe(
            map(([movimientos, { desde, hasta }]) => {
                return movimientos.filter((mov) => {
                    return desde.getTime() < mov.fecha.getTime() && mov.fecha.getTime() <= hasta.getTime();
                });
            })
        );

    }

    onChange() {
        const filtros = {
            desde: this.desde,
            hasta: this.hasta
        };

        if (this.desde && this.hasta) {
            const fechaDesdeValida = (this.desde <= this.hasta);
            const fechaHastaValida = (this.hasta <= moment().toDate() && this.hasta >= this.desde);

            if (fechaDesdeValida && fechaHastaValida) {
                this.historial.next(filtros);
            }
        }
    }

}
