import { Component, OnInit } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subject } from 'rxjs';
import { startWith, map, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-movimientos-internacion',
    templateUrl: './movimientos-internacion.component.html',
})

export class MovimientosInternacionComponent implements OnInit {

    prestacion$: Observable<IPrestacion>;

    public historial = new Subject();

    public historial$: Observable<any>;

    public desde = moment().toDate();

    public hasta = moment().toDate();

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {

        this.prestacion$ = this.mapaCamasService.prestacion$;

        this.historial$ = this.historial.pipe(
            startWith([]),
            map((filtros: any) => {
                return {
                    desde: moment(filtros.desde).startOf('day').toDate(),
                    hasta: moment(filtros.hasta).endOf('day').toDate(),
                };
            }),
            switchMap((filtros: any) => {
                return this.mapaCamasService.historial('internacion', filtros.desde, filtros.hasta);
            }),
            map((historial) => {
                return historial.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            })
        );
    }

    onChange() {
        const filtros = {
            desde: this.desde,
            hasta: this.hasta
        };
        this.historial.next(filtros);
    }

}
