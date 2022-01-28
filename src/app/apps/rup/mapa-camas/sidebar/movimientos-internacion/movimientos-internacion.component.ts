import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { auditTime, catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { MapaCamasService } from '../../services/mapa-camas.service';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit, OnDestroy {
    public fechasSeleccionadas = new Subject();

    public historial$: Observable<any>;

    public desde = moment(this.mapaCamasService.fecha).subtract(7, 'd').toDate();
    public hasta = this.mapaCamasService.fecha;

    onDestroy$ = new Subject();

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    getFechasInternacion() {
        const capa = this.mapaCamasService.capa2.getValue();
        if (capa === 'estadistica') {
            return this.mapaCamasService.prestacion$.pipe(
                map(prestacion => {
                    return {
                        desde: prestacion.ejecucion.registros[0].valor.informeIngreso.fechaIngreso,
                        hasta: prestacion.ejecucion.registros[1]?.valor.InformeEgreso?.fechaEgreso || new Date()
                    };
                }),
                catchError(() => of(null))
            );
        } else {
            return this.mapaCamasService.resumenInternacion$.pipe(
                map(prestacion => {
                    return {
                        desde: prestacion.fechaIngreso,
                        hasta: prestacion.fechaEgreso || new Date()
                    };
                }),
                catchError(() => of(null))
            );
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }


    ngOnInit() {
        this.onChange();

        this.getFechasInternacion().pipe(
            takeUntil(this.onDestroy$),
            auditTime(0)
        ).subscribe((datos: any) => {
            if (datos) {
                this.fechasSeleccionadas.next(datos);
                this.desde = datos.desde;
                this.hasta = datos.hasta;
            }
        });

        const fechaPipe = this.fechasSeleccionadas.pipe(
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

        this.historial$ = combineLatest([
            this.mapaCamasService.historialInternacion$,
            fechaPipe
        ]).pipe(
            map(([movimientos, { desde, hasta }]) => {
                return movimientos.filter((mov) => {
                    return desde.getTime() < mov.fecha.getTime() && mov.fecha.getTime() <= hasta.getTime();
                }).map(mov => {
                    if (mov.sectores) {
                        mov.sectorName = [...mov.sectores].reverse().map(s => s.nombre).join(', ');
                    }
                    return mov;
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
                this.fechasSeleccionadas.next(filtros);
            }
        }
    }

}
