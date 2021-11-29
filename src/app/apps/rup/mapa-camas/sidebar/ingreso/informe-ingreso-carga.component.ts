import { PrestacionesService } from './../../../../../modules/rup/services/prestaciones.service';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, of } from 'rxjs';
import { map, switchMap, filter, isEmpty } from 'rxjs/operators';
import { notNull } from '@andes/shared';
import { IResumenInternacion } from '../../services/resumen-internacion.http';

@Component({
    selector: 'app-informe-ingreso-carga',
    templateUrl: './informe-ingreso-carga.component.html',
})

export class InformeIngresoCargaComponent implements OnInit {
    resumenInternacion$: Observable<IResumenInternacion>;
    prestacion$: Observable<IPrestacion>;
    informeIngreso$: Observable<any>;
    paciente$: Observable<any>;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];

    // EVENTOS
    @Output() cancel = new EventEmitter<any>();
    @Output() toggleEditar = new EventEmitter<any>();

    constructor(
        private mapaCamasService: MapaCamasService,
        private prestacionesService: PrestacionesService
    ) { }

    ngOnInit() {
        this.resumenInternacion$ = this.mapaCamasService.resumenInternacion$;
        this.prestacion$ = this.resumenInternacion$.pipe(
            notNull(),
            switchMap((resumen) => {
                if (resumen.idPrestacion) {
                    return this.prestacionesService.getById(resumen.idPrestacion);
                };
                return of(null);
            })
        );
        this.informeIngreso$ = this.prestacion$.pipe(
            notNull(),
            map((prestacion) => {
                return prestacion.ejecucion.registros[0].valor.informeIngreso;
            })
        );
        this.paciente$ = this.prestacion$.pipe(
            notNull(),
            switchMap(prestacion => this.mapaCamasService.getPaciente(prestacion.paciente))
        );
        this.paciente$ = this.prestacion$.pipe(
            isEmpty(),
            switchMap(() => {
                return this.mapaCamasService.selectedCama.pipe(
                    filter(cama => !!cama.paciente),
                    switchMap(cama => {
                        return this.mapaCamasService.getPaciente(cama.paciente);
                    }));
            })
        );
    }
}
