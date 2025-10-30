import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { combineLatest, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { notNull } from '@andes/shared';
import { IInformeEstadistica } from 'src/app/modules/rup/interfaces/informe-estadistica.interface';
@Component({
    selector: 'app-informe-ingreso',
    templateUrl: './informe-ingreso.component.html',
})

export class InformeIngresoComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    informeIngreso$: Observable<any>;
    paciente$: Observable<any>;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    informeEstadistica$: Observable<IInformeEstadistica>;
    // EVENTOS
    @Output() toggleEditar = new EventEmitter<any>();

    constructor(
        private mapaCamasService: MapaCamasService,
    ) { }

    ngOnInit() {
        this.informeEstadistica$ = this.mapaCamasService.informeEstadistica$;
        this.prestacion$ = this.mapaCamasService.prestacion$;

        this.informeIngreso$ = combineLatest([
            this.informeEstadistica$,
            this.prestacion$
        ]).pipe(
            map(([informeEstadistica, prestacion]) => {
                if (informeEstadistica?.informeIngreso) {
                    return informeEstadistica.informeIngreso;
                }

                if (prestacion?.ejecucion?.registros?.[0]?.valor?.informeIngreso) {
                    return prestacion.ejecucion.registros[0].valor.informeIngreso;
                }

                return null;
            }),
            notNull()
        );

        this.paciente$ = combineLatest([
            this.informeEstadistica$,
            this.prestacion$
        ]).pipe(
            map(([informeEstadistica, prestacion]) => {
                if (informeEstadistica?.paciente) {
                    return informeEstadistica.paciente;
                }

                if (prestacion?.paciente) {
                    return prestacion.paciente;
                }

                console.warn('⚠️ No se encontró paciente ni en informeEstadistica ni en prestación');
                return null;
            }),
            notNull(),
            switchMap(paciente => this.mapaCamasService.getPaciente(paciente))
        );
    }

}
