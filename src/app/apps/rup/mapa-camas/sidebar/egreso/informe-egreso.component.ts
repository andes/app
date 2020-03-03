import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { notNull } from '@andes/shared';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-informe-egreso',
    templateUrl: './informe-egreso.component.html',
})

export class InformeEgresoComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    informeEgreso$: Observable<any>;

    // VARIABLES
    public prestacionValidada = false;

    constructor(
        public mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        this.prestacion$ = this.mapaCamasService.prestacion$;

        this.informeEgreso$ = this.prestacion$.pipe(
            notNull(),
            map((prestacion) => {
                return prestacion.ejecucion.registros[1].valor.InformeEgreso;
            })
        );
    }
}
