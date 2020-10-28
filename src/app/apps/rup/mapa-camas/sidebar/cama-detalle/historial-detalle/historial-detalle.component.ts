import { Component, Input, OnInit } from '@angular/core';
import { Subject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { ISnapshot } from '../../../interfaces/ISnapshot';
import { IMAQEstado } from '../../../interfaces/IMaquinaEstados';
import * as moment from 'moment';
@Component({
    selector: 'app-historial-detalle',
    templateUrl: './historial-detalle.component.html'
})
export class HistorialDetalleComponent implements OnInit {
    public cama$: Observable<ISnapshot>;
    public estados$: Observable<IMAQEstado[]>;

    public desde = moment(this.mapaCamasService.fecha).subtract(7, 'd').toDate();
    public hasta = this.mapaCamasService.fecha;

    public historial = new Subject();

    public historial$: Observable<any>;

    constructor(
        private mapaCamasService: MapaCamasService
    ) {
        this.cama$ = this.mapaCamasService.selectedCama;
        this.estados$ = this.mapaCamasService.estado$;
    }

    ngOnInit() {

        this.historial$ = this.historial.pipe(
            startWith({
                desde: this.desde, hasta: this.hasta
            }),
            map((filtros: any) => {
                return {
                    desde: moment(filtros.desde).startOf('day').toDate(),
                    hasta: moment(filtros.hasta).endOf('day').toDate(),
                };
            }),
            switchMap((filtros: any) => {
                return this.mapaCamasService.historial('cama', filtros.desde, filtros.hasta);
            }),
            map((historial: ISnapshot[]) => {
                return historial.filter(snap => snap.esMovimiento).sort((a, b) => {
                    const timeA = new Date(a.fecha).getTime();
                    const timeB = new Date(b.fecha).getTime();
                    return (timeB - timeA) !== 0 ? (timeB - timeA) : (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                });
            })
        );
    }

    onChange($event) {
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

    getEstado(movimiento) {
        return this.estados$.pipe(
            map((estados) => {
                return estados.find(est => movimiento.estado === est.key);
            })
        );
    }

}
