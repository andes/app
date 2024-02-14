import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';
import { IMAQEstado } from '../../../interfaces/IMaquinaEstados';
import { ISnapshot } from '../../../interfaces/ISnapshot';
import { MapaCamasService } from '../../../services/mapa-camas.service';

@Component({
    selector: 'app-historial-detalle',
    templateUrl: './historial-detalle.component.html',
    styleUrls: ['./historial-detalle.scss']
})
export class HistorialDetalleComponent implements OnInit {
    public cama$: Observable<ISnapshot>;
    public estados$: Observable<IMAQEstado[]>;

    public desde = moment(this.mapaCamasService.fecha).subtract(7, 'd').toDate();
    public hasta = this.mapaCamasService.fecha;

    public historial = new Subject();

    public historial$: Observable<any>;

    public disableBuscar = false;

    constructor(
        private mapaCamasService: MapaCamasService,
    ) {
        this.cama$ = this.mapaCamasService.selectedCama;
        this.estados$ = this.mapaCamasService.estado$;
    }

    ngOnInit() {
        this.historial$ = null;
    }

    onChange() {
        if (this.desde && this.hasta) {
            const fechaDesdeValida = (this.desde <= this.hasta);
            const fechaHastaValida = (this.hasta <= moment().toDate() && this.hasta >= this.desde);

            this.disableBuscar = !(fechaDesdeValida && fechaHastaValida);
        } else { this.disableBuscar = true; }
    }

    getEstado(movimiento) {
        return this.estados$.pipe(
            map((estados) => {
                return estados.find(est => movimiento.estado === est.key);
            })
        );
    }

    buscar() {
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
                return historial.sort((a, b) => {
                    const timeA = new Date(a.fecha).getTime();
                    const timeB = new Date(b.fecha).getTime();
                    return (timeB - timeA) !== 0 ? (timeB - timeA) : (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                });
            }),
            map((historial: ISnapshot[]) => {
                return historial.filter(h => h.esMovimiento !== false);
            })
        );
    }
}
