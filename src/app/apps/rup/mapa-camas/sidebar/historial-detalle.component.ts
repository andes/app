import { Component, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { map, switchMap, startWith } from 'rxjs/operators';
import { MapaCamasService } from '../mapa-camas.service';

@Component({
    selector: 'app-historial-detalle',
    templateUrl: './historial-detalle.component.html'
})
export class HistorialDetalleComponent {
    @Input() ambito = 'internacion';
    @Input() capa = '';

    @Input() cama: any;
    @Input() estados: any;

    public desde: Date = new Date();
    public hasta: Date = new Date();

    public historial = new Subject();

    public historial$ = this.historial.asObservable().pipe(
        startWith([]),
        map((filtros: any) => {
            return {
                desde: moment(filtros.desde).startOf('day').toDate(),
                hasta: moment(filtros.hasta).endOf('day').toDate(),
            };
        }),
        switchMap((filtros: any) => {
            return this.mapaCamasService.historial(this.ambito, this.capa, this.cama.idCama, filtros.desde, filtros.hasta);
        }),
    );

    constructor(
        private mapaCamasService: MapaCamasService
    ) { }

    onChange($event) {
        const filtros = {
            desde: this.desde,
            hasta: this.hasta
        };
        this.historial.next(filtros);
    }

    getEstado(movimiento) {
        return this.estados.find(est => movimiento.estado === est.key);
    }

}
