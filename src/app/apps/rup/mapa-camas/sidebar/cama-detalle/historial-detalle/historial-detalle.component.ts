import { Component, Input, OnInit } from '@angular/core';
import { Subject, Observable, combineLatest } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { ISnapshot } from '../../../interfaces/ISnapshot';
import { IMAQEstado } from '../../../interfaces/IMaquinaEstados';

@Component({
    selector: 'app-historial-detalle',
    templateUrl: './historial-detalle.component.html'
})
export class HistorialDetalleComponent implements OnInit {
    public cama$: Observable<ISnapshot>;
    public estados$: Observable<IMAQEstado[]>;

    public desde: Date = new Date();
    public hasta: Date = new Date();

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
            startWith([]),
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
                return historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            })
        );
    }

    onChange($event) {
        const filtros = {
            desde: this.desde,
            hasta: this.hasta
        };
        this.historial.next(filtros);
    }

    getEstado(movimiento) {
        return this.estados$.pipe(
            map((estados) => {
                return estados.find(est => movimiento.estado === est.key);
            })
        );
    }

}
