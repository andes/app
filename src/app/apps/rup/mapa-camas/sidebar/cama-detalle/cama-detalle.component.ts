import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { map, switchMap, pluck, filter } from 'rxjs/operators';
import { combineLatest, Observable } from 'rxjs';
import { IMAQEstado, IMAQRelacion } from '../../interfaces/IMaquinaEstados';
import { notNull } from '@andes/shared';
import { Plex } from '@andes/plex';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { TurneroService } from 'src/app/apps/turnero/services/turnero.service';
import { ModalMotivoAccesoHudsService } from 'src/app/modules/rup/components/huds/modal-motivo-acceso-huds.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';


@Component({
    selector: 'app-cama-detalle',
    templateUrl: 'cama-detalle.component.html'
})
export class CamaDetalleComponent implements OnInit {
    public cama$: Observable<ISnapshot>;
    public estadoCama$: Observable<IMAQEstado>;
    public relaciones$: Observable<IMAQRelacion[]>;

    public accionesEstado$: Observable<any>;
    public paciente$: Observable<any>;

    // Eventos
    @Input() fecha: Date;
    @Input() camas: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() cancel = new EventEmitter<any>();
    @Output() accionCama = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public capa: string;
    public cama: ISnapshot;
    public prestacion: IPrestacion;
    public estadoCama;
    public genero;
    public censable;
    public paciente;
    public edadPaciente;
    public relacionesPosibles;
    public especialidades;
    public validadoColor;
    public titleColor;
    public tabIndex = 0;
    public editar = false;
    public permisoIngreso = false;
    canUndo = false;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    public nota: String;
    public editNota = false;

    public fechaMin$: Observable<Date>;
    public hayMovimientosAt$: Observable<Boolean>;
    public camaSelectedSegunView$: Observable<ISnapshot> = this.mapaCamasService.camaSelectedSegunView$;

    public turnero$: Observable<string>;

    constructor(
        public plex: Plex,
        private router: Router,
        private mapaCamasService: MapaCamasService,
        private mapaCamasHTTP: MapaCamasHTTP,
        private prestacionesService: PrestacionesService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private turneroService: TurneroService,
        private motivoAccesoService: ModalMotivoAccesoHudsService
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;
        this.cama$ = this.mapaCamasService.selectedCama;
        this.paciente$ = this.cama$.pipe(
            filter(cama => !!cama.paciente),
            switchMap(cama => {
                return this.mapaCamasService.getPaciente(cama.paciente);
            })
        );

        this.turnero$ = combineLatest(
            this.cama$,
            this.mapaCamasService.maquinaDeEstado$
        ).pipe(
            map(([cama, estado]) => {
                if (cama.idInternacion) {
                    const turnero = estado.turnero || {};
                    if (turnero[cama.id]) {
                        return turnero[cama.id];
                    }
                }
                return null;
            })
        );

        this.estadoCama$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getEstadoCama(cama)));
        this.relaciones$ = this.cama$.pipe(switchMap(cama => this.mapaCamasService.getRelacionesPosibles(cama)));

        this.accionesEstado$ = this.estadoCama$.pipe(
            notNull(),
            pluck('acciones'),
            map(acciones => acciones.filter(acc => acc.tipo === 'nuevo-registro'))
        );

        this.hayMovimientosAt$ = this.mapaCamasService.historialInternacion$.pipe(
            map((historial) => {
                // true si cada movimiento tiene idMovimiento o es un ingreso
                return historial.length > 0 && !historial.some((mov: any) => !mov.extras?.ingreso && mov.idMovimiento === undefined);
            })
        );
    }

    sector(cama: ISnapshot) {
        return cama.sectores[cama.sectores.length - 1].nombre;
    }

    cancelar() {
        this.cancel.emit();
    }

    cambiarTab(index) {
        if (!this.editNota) {
            this.mapaCamasService.resetView();
            this.tabIndex = index;
        }
    }

    goTo(cama) {
        if (cama.sala) {
            this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/sala-comun/${cama.id}`]);
        } else {
            this.router.navigate([`/mapa-camas/${this.mapaCamasService.ambito}/cama/${cama.id}`]);
        }
    }

    accion(relacion) {
        this.accionCama.emit(relacion);
    }

    onEdit(editar: boolean) {
        this.editar = editar;
    }

    refrescar(accion) {
        this.refresh.emit(accion);
    }

    // [TODO] Revisar el tema bubble up
    onAccion($event) {
        if ($event) {
            if ($event.accion === 'nuevo-registro') {
                this.onNuevoRegistrio();
            }
        }
    }


    onNuevoRegistrio() {
        this.accionCama.emit({ accion: 'nuevo-registro' });
    }

    toggleEditNota(value: boolean, nota) {
        this.nota = nota;
        this.editNota = value;
    }

    guardarNota(cama) {
        cama.nota = this.nota;
        this.mapaCamasService.save(cama, moment().toDate(), false).subscribe(camaNota => {
            this.plex.info('success', 'Nota guardada');
            this.editNota = false;
        });
    }

    deshacerInternacion(cama) {
        this.plex.confirm('Esta acción deshace una internación, es decir, ya no figurará en el listado. ¡Esta acción no se puede revertir!', '¿Quiere deshacer esta internación?').then((resultado) => {
            if (resultado) {
                this.mapaCamasHTTP.deshacerInternacion(this.mapaCamasService.ambito, this.mapaCamasService.capa, cama.fecha, cama)
                    .subscribe((internacion) => {
                        if (this.mapaCamasService.capa === 'estadistica') {
                            const prestacion = { id: internacion.idInternacion, solicitud: { turno: null } };
                            this.prestacionesService.invalidarPrestacion(prestacion).subscribe();
                        }
                        this.plex.info('success', 'Se deshizo la internacion', 'Éxito');
                        this.mapaCamasService.select(null);
                        this.mapaCamasService.setFecha(this.mapaCamasService.fecha);
                        this.cancel.emit();
                    });
            }
        });
    }


    llamarTurnero(pantalla: string, cama: ISnapshot) {
        this.turneroService.llamarInternacion(pantalla, cama);
    }

    onVerResumen(cama: ISnapshot) {
        this.motivoAccesoService.getAccessoHUDS(cama.paciente as IPaciente).subscribe(() => {
            const capa = this.mapaCamasService.capa;
            const ambito = this.mapaCamasService.ambito;
            this.router.navigate([`/mapa-camas/${ambito}/${capa}/resumen/${cama.idInternacion}`]);
        });
    }
}
