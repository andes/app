import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { notNull } from '@andes/shared';

@Component({
    selector: 'app-informe-ingreso',
    templateUrl: './informe-ingreso.component.html',
})

export class InformeIngresoComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    informeIngreso$: Observable<any>;
    paciente$: Observable<any>;

    // EVENTOS
    @Output() cancel = new EventEmitter<any>();
    @Output() toggleEditar = new EventEmitter<any>();

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.prestacion$ = this.mapaCamasService.prestacion$;

        this.informeIngreso$ = this.prestacion$.pipe(
            notNull(),
            map((prestacion) => {
                return prestacion.ejecucion.registros[0].valor.informeIngreso;
            })
        );

        this.paciente$ = this.prestacion$.pipe(
            notNull(),
            map((prestacion) => {
                return prestacion.paciente;
            })
        );
    }
}
