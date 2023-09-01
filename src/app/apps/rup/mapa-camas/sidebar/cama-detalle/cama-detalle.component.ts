import { Plex } from '@andes/plex';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { combineLatest, Observable, of } from 'rxjs';
import { filter, first, map, switchMap } from 'rxjs/operators';
import { TurneroService } from 'src/app/apps/turnero/services/turnero.service';
import { IPaciente } from 'src/app/core/mpi/interfaces/IPaciente';
import { ModalMotivoAccesoHudsService } from 'src/app/modules/rup/components/huds/modal-motivo-acceso-huds.service';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { IPrestacion } from '../../../../../modules/rup/interfaces/prestacion.interface';
import { IMAQEstado, IMAQRelacion } from '../../interfaces/IMaquinaEstados';
import { ISnapshot } from '../../interfaces/ISnapshot';
import { MapaCamasHTTP } from '../../services/mapa-camas.http';
import { MapaCamasService } from '../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../services/permisos-mapa-camas.service';
import { InternacionResumenHTTP } from '../../services/resumen-internacion.http';
import { OrganizacionService } from 'src/app/services/organizacion.service';
import { Auth } from '@andes/auth';


@Component({
    selector: 'app-cama-detalle',
    templateUrl: 'cama-detalle.component.html'
})
export class CamaDetalleComponent implements OnInit {
    public cama$: Observable<ISnapshot>;
    public estadoCama$: Observable<IMAQEstado>;
    public relaciones$: Observable<IMAQRelacion[]>;
    public organizacionV2$: Observable<Boolean>;
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
    public puedeVerHuds;
    public edadPaciente;
    public relacionesPosibles;
    public especialidades;
    public validadoColor;
    public titleColor;
    public tabIndex = 0;
    public editar = false;
    pacienteFields = ['sexo', 'fechaNacimiento', 'edad', 'cuil', 'financiador', 'numeroAfiliado', 'direccion', 'telefono'];
    public nota: String;
    public editNota = false;
    public fechaMin$: Observable<Date>;
    public hayMovimientosAt$: Observable<Boolean>;

    public turnero$: Observable<string>;
    public hayRespirador$: Observable<any>;
    public botonRegistroHabilitado$;

    items = [
        {
            label: 'Último movimiento',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.deshacerInternacion(false);
            }
        },
        {
            label: 'Toda la internación',
            handler: ($event: Event) => {
                $event.stopPropagation();
                this.deshacerInternacion(true);
            }
        }
    ];

    constructor(
        public plex: Plex,
        private router: Router,
        private mapaCamasService: MapaCamasService,
        private mapaCamasHTTP: MapaCamasHTTP,
        private prestacionesService: PrestacionesService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private turneroService: TurneroService,
        private motivoAccesoService: ModalMotivoAccesoHudsService,
        private internacionResumenHTTP: InternacionResumenHTTP,
        private organizacionService: OrganizacionService,
        private auth: Auth
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;
        this.cama$ = this.mapaCamasService.selectedCama;
        this.puedeVerHuds = this.auth.check('huds:visualizacionHuds');
        this.paciente$ = this.cama$.pipe(
            filter(cama => !!cama.paciente),
            switchMap(cama => cama.paciente ? this.mapaCamasService.getPaciente(cama.paciente) : of(null))
        );

        this.turnero$ = combineLatest([
            this.cama$,
            this.mapaCamasService.maquinaDeEstado$
        ]).pipe(
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
        this.accionesEstado$ = this.mapaCamasService.prestacionesPermitidas(this.mapaCamasService.selectedCama);
        this.organizacionV2$ = this.organizacionService.usaCapasUnificadas(this.auth.organizacion.id);

        this.hayMovimientosAt$ = this.mapaCamasService.historialInternacion$.pipe(
            map((historial) => {
                const egreso = historial.some(mov => mov.extras?.egreso);
                const tieneIDMov = historial.every(
                    mov => mov.extras?.ingreso || mov.extras?.idMovimiento
                );
                return historial.length > 0 && tieneIDMov && !egreso;
            })
        );

        this.hayRespirador$ = this.mapaCamasService.resumenInternacion$.pipe(
            map(resumen => {
                const respirador = resumen?.registros?.reverse().find(r => r.tipo === 'respirador');
                return respirador?.valor.fechaHasta ? null : respirador;
            })
        );
        this.botonRegistroHabilitado$ = this.mapaCamasService.controlRegistros();
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

    // Para la ejecucion de acciones de una cama, segun sus relaciones.
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
            if ($event.accion === 'nuevo-egreso') {
                this.cancelar();
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

    // parametro 'completo' indica si se borra solo un movimiento ó la internación completa
    deshacerInternacion(completo: boolean) {
        const msjDeshacer = (completo) ? 'Si el paciente tiene prestaciones  se deberá <b>romper validación</b> de las mismas antes de intentar realizar esta acción. <br><br><b>¿Está seguro que desea anular la internación?</b>' : 'Esta acción deshace el último movimiento.<br><b>¡Esta acción no se puede revertir!</b> ';
        const msjTitulo = (completo) ? 'internación' : 'movimiento';
        this.plex.confirm(msjDeshacer, 'Anular ' + msjTitulo).then((resultado) => {
            if (resultado) {
                this.cama$.pipe(
                    first(),
                    switchMap(cama => this.mapaCamasHTTP.deshacerInternacion(this.mapaCamasService.ambito, this.mapaCamasService.capa, cama.idInternacion, completo)),
                    switchMap(response => {
                        // hasta acá borramos movimiento(s) y resumen pero no anulamos la prestación
                        if (this.capa === 'medica') {
                            return of(null);
                        }
                        // status es true si se desea eliminar internacion completa
                        if (response.status) {
                            return this.cama$.pipe(
                                first(),
                                switchMap(cama => {
                                    if (this.capa === 'estadistica') {
                                        return of(cama.idInternacion);
                                    }
                                    if (this.capa === 'estadistica-v2') {
                                        return this.internacionResumenHTTP.get(cama.idInternacion).pipe(
                                            map(resumen => resumen?.idPrestacion)
                                        );
                                    }
                                })
                            );
                        }
                    }),
                    switchMap(idPrestacion => {
                        if (idPrestacion) {
                            return this.prestacionesService.invalidarPrestacion({ id: idPrestacion, solicitud: { turno: null } });
                        }
                        return of(null);
                    })
                ).subscribe(() => {
                    const mensaje = completo ? 'Se deshizo la internación' : 'Se deshizo el úlitmo movimiento';
                    this.plex.info('success', mensaje, 'Éxito');
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

    onVerIndicaciones(cama: ISnapshot) {
        const capa = this.mapaCamasService.capa;
        const ambito = this.mapaCamasService.ambito;
        this.router.navigate([`/mapa-camas/${ambito}/${capa}/plan-indicaciones/${cama.idInternacion}`]);
    }

    registraRespirador(respirador) {
        return respirador?.fechaDesde && !respirador.fechaHasta;
    }

    relacionesYcondiciones(relacion, cama) {
        return this.capa !== 'interconsultores' && ((relacion.accion !== 'internarPaciente' &&
            relacion.nombre !== 'Bloquear') || (relacion.accion === 'internarPaciente' && this.permisosMapaCamasService.ingreso) ||
            (relacion.nombre === 'Bloquear' && this.permisosMapaCamasService.bloqueo && !cama.sala));
    }

    verIndicacion() {
        return this.permisosMapaCamasService.indicacionesCrear || this.permisosMapaCamasService.indicacionesEjecutar ||
            this.permisosMapaCamasService.indicacionesValidar || this.permisosMapaCamasService.indicacionesVer;
    }
}
