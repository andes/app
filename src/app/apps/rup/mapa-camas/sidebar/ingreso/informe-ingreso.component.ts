import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { notNull } from '@andes/shared';

@Component({
    selector: 'app-informe-ingreso',
    templateUrl: './informe-ingreso.component.html',
})

export class InformeIngresoComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    informeIngreso$: Observable<any>;
    paciente$: Observable<any>;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];

    // EVENTOS
    @Output() toggleEditar = new EventEmitter<any>();

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.prestacion$ = this.mapaCamasService.prestacion$;
        this.informeIngreso$ = this.prestacion$.pipe(
            notNull(),
            map((prestacion) => prestacion.ejecucion.registros[0].valor.informeIngreso)
        );
        this.paciente$ = this.prestacion$.pipe(
            notNull(),
            switchMap(prestacion => this.mapaCamasService.getPaciente(prestacion.paciente))
        );
    }
}
