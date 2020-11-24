import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subject, Subscription, combineLatest } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';
import { ISnapshot } from '../../interfaces/ISnapshot';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit, OnDestroy {
    public historial = new Subject();

    public historial$: Observable<any>;

    public desde;
    public hasta;

    private subscription: Subscription;

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.subscription = combineLatest(
            this.mapaCamasService.view,
            this.mapaCamasService.prestacion$,
            this.mapaCamasService.selectedPrestacion,
        ).subscribe(([view, prestacionMapaCamas, prestacionListado]) => {
            const prestacion = (view === 'mapa-camas') ? prestacionMapaCamas : prestacionListado;
            if (prestacion && prestacion.id !== null) {
                this.desde = prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso;
                if (prestacion.ejecucion.registros[1]) {
                    this.hasta = prestacion.ejecucion.registros[1].valor.InformeEgreso.fechaEgreso;
                } else {
                    this.hasta = moment().toDate();
                }
                this.onChange();
            }
        });


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
            const fechaHastaValida = (this.hasta >= this.desde);

            if (fechaDesdeValida && fechaHastaValida) {
                this.historial.next(filtros);
            }
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
