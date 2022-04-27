import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { notNull, cache } from '@andes/shared';
import { IResumenInternacion } from '../../services/resumen-internacion.http';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';

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

    constructor(
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private prestacionService: PrestacionesService
    ) { }

    ngOnInit() {
        this.resumenInternacion$ = this.mapaCamasService.resumenInternacion$;
        this.prestacion$ = this.resumenInternacion$.pipe(
            switchMap(resumen => {
                if (resumen.idPrestacion) {
                    return this.prestacionService.getById(resumen.idPrestacion, { showError: false });
                }
                return of(null);
            }),
            catchError(() => of(null)),
            cache()
        );
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
                const paciente = prestacion?.paciente || cama.paciente;
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
