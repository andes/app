import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, of } from 'rxjs';
import { Auth } from '@andes/auth';
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
    accionesEstado$: Observable<any>;
    prestacion$: Observable<IPrestacion>;
    informeIngreso$: Observable<any>;
    paciente$: Observable<any>;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    public esProfesional = this.auth.profesional;

    // EVENTOS
    @Output() toggleEditar = new EventEmitter<any>();
    @Output() accion = new EventEmitter<any>();

    constructor(
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private prestacionService: PrestacionesService,
        private auth: Auth,
    ) { }

    ngOnInit() {
        this.resumenInternacion$ = this.mapaCamasService.resumenInternacion$;
        this.prestacion$ = this.resumenInternacion$.pipe(
            switchMap(resumen => {
                if (resumen.idPrestacion) {
                    if ((resumen.idPrestacion as any)?.id) {
                        // prestacion populada desde el listado
                        return of(resumen.idPrestacion);
                    }
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
        this.paciente$ = this.resumenInternacion$.pipe(
            switchMap(resumen => resumen?.paciente ? this.mapaCamasService.getPaciente(resumen.paciente) : of(null))
        );
        this.accionesEstado$ = this.mapaCamasService.camaSelectedSegunView$.pipe(
            switchMap(cama => this.mapaCamasService.prestacionesPermitidas(of(cama))),
            cache()
        );
    }

    toggleEdit() {
        this.toggleEditar.emit();
    }

    onNuevoRegistrio() {
        this.accion.emit({ accion: 'nuevo-registro' });
    }

    generarRegistro(acciones, permisos) {
        return (acciones?.length && permisos && this.esProfesional) ? true : false;
    }
}
