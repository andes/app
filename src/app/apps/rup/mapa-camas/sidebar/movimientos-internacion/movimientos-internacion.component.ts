import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable, of, Subject } from 'rxjs';
import { auditTime, catchError, map, startWith, takeUntil, switchMap } from 'rxjs/operators';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';
import { IResumenInternacion } from '../../services/resumen-internacion.http';

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
        private mapaCamasHTTP: MapaCamasHTTP
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
                map(resumen => {
                    return {
                        desde: resumen.fechaIngreso,
                        hasta: resumen.fechaEgreso || new Date()
                    };
                }),
                catchError(() => of(null))
            );
        }
    }

    ngOnDestroy() {
        this.onDestroy$.next(null);
        this.onDestroy$.complete();
    }


    ngOnInit() {
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

        let requestPrestacion: Observable<IPrestacion | IResumenInternacion>;
        if (this.mapaCamasService.capa === 'estadistica') {
            requestPrestacion = this.mapaCamasService.selectedPrestacion;
        } else {
            // se estaría usando capas unificadas
            requestPrestacion = this.mapaCamasService.selectedResumen;
        }

        this.historial$ = combineLatest([
            requestPrestacion,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.capa2,
            fechaPipe
        ]).pipe(
            switchMap(([requestPrestacion, cama, capa, { desde, hasta }]) => {
                const idInternacion = cama?.idInternacion || (requestPrestacion as any).id;
                if (capa && idInternacion) {
                    return this.mapaCamasHTTP.historialInternacion('internacion', capa, desde, hasta, idInternacion)?.pipe(
                        map(movimientos => {
                            return movimientos.filter((mov) => {
                                return desde.getTime() <= mov.fecha.getTime() && mov.fecha.getTime() <= hasta.getTime();
                            }).map(mov => {
                                if (mov.sectores) {
                                    mov.sectorName = [...mov.sectores].reverse().map(s => s.nombre).join(', ');
                                }
                                return mov;
                            }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
                        })
                    );
                }
                return of(null);
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
