import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { notNull } from '@andes/shared';
import { IResumenInternacion } from '../../services/resumen-internacion.http';

@Component({
    selector: 'app-informe-ingreso-estadistica-v2',
    templateUrl: './informe-ingreso-estadistica-v2.html',
})

export class InformeIngresoEstadisticaV2Component implements OnInit {
    resumenInternacion$: Observable<IResumenInternacion>;
    prestacion$: Observable<IPrestacion>;
    informeIngreso$: Observable<any>;
    paciente$: Observable<any>;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];

    // EVENTOS
    @Output() cancel = new EventEmitter<any>();
    @Output() toggleEditar = new EventEmitter<any>();
    @Input() capa;
    @Input() permisosIngreso;

    constructor(
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        this.resumenInternacion$ = this.mapaCamasService.resumenInternacion$;
        this.prestacion$ = this.mapaCamasService.prestacionSegunView$;
        this.informeIngreso$ = this.prestacion$.pipe(
            notNull(),
            map((prestacion) => {
                return prestacion.ejecucion?.registros[0].valor.informeIngreso;
            })
        );

        this.paciente$ = combineLatest([
            this.prestacion$,
            this.mapaCamasService.selectedCama
        ]).pipe(
            switchMap(([prestacion, cama]) => {
                const paciente = prestacion.paciente || cama.paciente;
                if (paciente) {
                    return this.mapaCamasService.getPaciente(paciente);
                }
                return of(null);
            })
        );
    }

    toggleEdit() {
        this.toggleEditar.emit();
    }
}
