import { Component, OnInit } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
// import { MapaCamasHTTP } from '../../services/mapa-camas.http';

interface Periodo {
    desde: Date;
    hasta: Date;
}

@Component({
    selector: 'app-periodos-censables',
    templateUrl: './periodos-censables.html',
    styleUrls: ['./periodos-censables.scss']
})

export class PeriodosCensablesComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    agregar = false;
    nuevoPeriodo: Periodo;
    periodos: Periodo[] = [];

    constructor(
        private mapaCamasService: MapaCamasService,
        private servicioPrestacion: PrestacionesService,
    ) { }

    ngOnInit() {
        this.prestacion$ = this.mapaCamasService.prestacion$;
        this.initNuevoPeriodo();
    }

    private initNuevoPeriodo() {
        this.nuevoPeriodo = {
            desde: moment().toDate(),
            hasta: null
        };
    }

    public toggleAgregar() {
        this.agregar = !this.agregar;
    }

    public guardar() {
        console.log('guardar');

        const desde = this.nuevoPeriodo.desde;
        const hasta = this.nuevoPeriodo.hasta;

        if (desde && hasta) {
            // this.mapaCamasService.censoMensual(desde, hasta, null).subscribe((res) => {
            //     console.log(res);
            // });

            this.prestacion$.subscribe((prestacion) => {
                console.log('prestacion', prestacion);
                // this.servicioPrestacion.patch()

                this.periodos.push(this.nuevoPeriodo);

                console.log(this.periodos);
            });
        }
    }

    public cancelar() {
        this.agregar = false;
        this.initNuevoPeriodo();
    }
}
