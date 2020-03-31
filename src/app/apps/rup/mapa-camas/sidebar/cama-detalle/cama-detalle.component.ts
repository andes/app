import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PrestacionesService } from '../../../../../modules/rup/services/prestaciones.service';
import { ElementosRUPService } from '../../../../../modules/rup/services/elementosRUP.service';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { tap, map, switchMap, startWith } from 'rxjs/operators';
import { Observable, combineLatest, of, Subscription } from 'rxjs';
import { IMAQEstado, IMAQRelacion } from '../../interfaces/IMaquinaEstados';
import { PacienteService } from '../../../../../core/mpi/services/paciente.service';


@Component({
    selector: 'app-cama-detalle',
    templateUrl: 'cama-detalle.component.html'
})
export class CamaDetalleComponent implements OnInit, OnDestroy {
    public cama$: Observable<ISnapshot>;
    public estadoCama$: Observable<IMAQEstado>;
    public relaciones$: Observable<IMAQRelacion[]>;
    public puedeDesocupar$: Observable<any>;

    // Eventos
    @Input() fecha: Date;
    @Input() camas: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public cama: ISnapshot;
    public capa: string;
    public prestacion: IPrestacion;
    public estadoCama;
    public genero;
    public censable;
    public paciente;
    public edadPaciente;
    public relacionesPosibles;
    public especialidades;
    public validadoColor;
    public conceptosInternacion;
    public titleColor;
    public tabIndex = 0;
    public editar = false;

    private subscription: Subscription;

    constructor(
        private router: Router,
        private prestacionService: PrestacionesService,
        private elementoRupService: ElementosRUPService,
        private mapaCamasService: MapaCamasService,
        private pacienteService: PacienteService
    ) {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;

        this.elementoRupService.ready.subscribe(() => {
            this.conceptosInternacion = this.elementoRupService.getConceptosInternacion();
        });

        this.cama$ = this.mapaCamasService.selectedCama;

        this.estadoCama$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getEstadoCama(cama)));
        this.relaciones$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getRelacionesPosibles(cama)));

        this.subscription = combineLatest(
            this.mapaCamasService.capa2,
            this.mapaCamasService.selectedCama
        ).subscribe(([capa, cama]) => {
            if (capa === 'estadistica') {
                if (cama.estado === 'ocupada') {
                    this.prestacionService.getById(cama.idInternacion).subscribe(prestacion => {
                        this.puedeDesocupar$ = this.mapaCamasService.verificarCamaDesocupar(cama, prestacion);
                    });
                }
            }
        });
    }

    sector(cama: ISnapshot) {
        return cama.sectores[cama.sectores.length - 1].nombre;
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarTab(index) {
        this.tabIndex = index;
    }

    goTo(cama) {
        this.router.navigate([`/internacion/cama/${cama.idCama}`]);
    }

    accion(relacion) {
        this.accionCama.emit(relacion);
    }

    /**
       * Crea la prestacion de epicrisis, si existe recupera la epicrisis
       * creada anteriormente.
       * Nos rutea a la ejecucion de RUP.
       */
    generaEpicrisis() {
        this.prestacionService.get({ idPrestacionOrigen: this.cama.idInternacion }).subscribe(prestacionExiste => {
            if (prestacionExiste.length === 0) {
                let nuevaPrestacion = this.prestacionService.inicializarPrestacion(this.paciente, this.conceptosInternacion.epicrisis, 'ejecucion', 'internacion');
                nuevaPrestacion.solicitud.prestacionOrigen = this.cama.idInternacion;
                this.prestacionService.post(nuevaPrestacion).subscribe(prestacion => {
                    this.router.navigate(['rup/ejecucion', prestacion.id]);
                });
            } else {
                this.router.navigate(['rup/ejecucion', prestacionExiste[0].id]);
            }
        });
    }

    onEdit(editar: boolean) {
        this.editar = editar;
    }

    refrescar(accion) {
        this.refresh.emit(accion);
    }

    private paciente$: any = {};
    getPaciente(paciente) {
        if (!this.paciente$[paciente.id]) {
            this.paciente$[paciente.id] = this.pacienteService.getById(paciente.id).pipe(
                startWith(paciente)
            );
        }
        return this.paciente$[paciente.id];
    }
}
