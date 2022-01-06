import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { Observable, of } from 'rxjs';
import { switchMap, isEmpty, filter } from 'rxjs/operators';
import { notNull } from '@andes/shared';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { IPrestacion } from 'src/app/modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'app-informe-ingreso-resumen',
    templateUrl: './informe-ingreso-resumen.html',
})

export class InformeIngresoResumenComponent implements OnInit {
    resumenInternacion$: Observable<any>;
    prestacion$: Observable<IPrestacion>;
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
        this.paciente$ = this.prestacion$.pipe(
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
