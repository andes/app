import { Plex, PlexOptionsComponent } from '@andes/plex';
import { Component, EventEmitter, OnInit, Output, AfterViewChecked, ChangeDetectorRef, ViewChild, Input } from '@angular/core';
import { combineLatest, Observable, of } from 'rxjs';
import { auditTime, map, switchMap, take } from 'rxjs/operators';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { MapaCamasHTTP } from '../../../services/mapa-camas.http';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionCapasService } from '../../../views/listado-internacion-capas/listado-internacion-capas.service';
import { ListadoInternacionService } from '../../../views/listado-internacion/listado-internacion.service';
import { IngresoPacienteService } from '../../ingreso/ingreso-paciente-workflow/ingreso-paciente-workflow.service';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, AfterViewChecked {
    puedeDesocupar$: Observable<any>;
    resumenInternacion$: Observable<any>;
    public estadoPrestacion;
    public editarIngresoIdInternacion;
    public editarEgreso;
    public existeIngreso;
    public existeEgreso;
    view$ = this.mapaCamasService.view;

    @Input() paciente;
    @Output() cambiarCama = new EventEmitter<any>();
    @Output() accion = new EventEmitter<any>();
    @ViewChild('options', { static: true }) plexOptions: PlexOptionsComponent;

    public mostrar;
    public registraEgreso$: Observable<boolean>;
    public anular$: Observable<boolean>;
    public capa;
    public inProgress;

    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'registros', label: 'REGISTROS' }
    ];

    constructor(
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private mapaCamasHTTP: MapaCamasHTTP,
        private plex: Plex,
        private prestacionesService: PrestacionesService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private listadoInternacion: ListadoInternacionService,
        private cdr: ChangeDetectorRef,
        private ingresoPacienteService: IngresoPacienteService
    ) { }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    agregarItem(item: string) {
        const tabItem = this.items.find(i => i.key === item);
        if (!tabItem) {
            this.items.push({ key: item, label: item.toUpperCase() });
        }
    }

    quitarItem(item) {
        const tabItem = this.items.findIndex(i => i.key === item);
        if (tabItem !== -1) {
            this.items.splice(tabItem, 1);
        }
    }

    ngOnInit() {
        this.mostrar = 'ingreso';
        this.editarIngresoIdInternacion = null;
        this.editarEgreso = false;
        this.capa = this.mapaCamasService.capa;

        this.mapaCamasService.historialInternacion$.subscribe(
            historial => {
                if (historial.length && (this.capa === 'estadistica' || historial.some(mov => mov.extras.egreso))) {
                    this.agregarItem('egreso');
                } else {
                    this.quitarItem('egreso');
                    if (this.mostrar === 'egreso') {
                        this.activateOption(this.items[0].key);
                    }
                }
            }
        );

        this.mapaCamasService.prestacion$.subscribe(prestacion => {
            this.estadoPrestacion = '';
            this.existeIngreso = false;

            if (prestacion) {
                this.estadoPrestacion = prestacion.estadoActual.tipo;
                if (prestacion.ejecucion.registros[0].valor.informeIngreso) {
                    this.existeIngreso = true;
                }
                this.existeEgreso = !!prestacion.ejecucion.registros[1]?.valor?.InformeEgreso;
                this.editarEgreso = !this.existeEgreso;
                this.ingresoPacienteService.selectPaciente(prestacion.paciente?.id);
            }
            // loading se setea en true desde el listado de internacion
            this.mapaCamasService.isLoading(false);
        });

        // Configura los tabs a mostrar según capa y vista
        this.mapaCamasService.resumenInternacion$.pipe(
            map(resumen => {
                if (this.capa === 'estadistica') {
                    return;
                }
                if (this.editarIngresoIdInternacion && this.editarIngresoIdInternacion !== resumen.paciente?.id) {
                    this.toggleEdit();
                }
                this.capa = this.mapaCamasService.capa;
                if (resumen) {
                    if (this.capa !== 'estadistica-v2') {
                        if (resumen?.ingreso) {
                            this.items[0] = { key: 'ingreso-dinamico', label: 'INGRESO' };
                            this.mostrar = 'ingreso-dinamico';
                        }
                    }
                    this.existeEgreso = !!resumen.fechaEgreso;
                    this.editarEgreso = !this.existeEgreso;
                    this.ingresoPacienteService.selectPaciente(resumen.paciente?.id);
                }

                if (!this.permisosMapaCamasService.registros) {
                    this.quitarItem('registros');
                }
            })
        ).subscribe();

        this.registraEgreso$ = this.mapaCamasService.historialInternacion$.pipe(
            map((historial) => {
                // loading se setea en true desde el listado de internacion medico
                this.mapaCamasService.isLoading(false);
                const egresoOSala = historial.some(mov => mov.extras?.egreso || mov.idSalaComun);
                return egresoOSala;
            })
        );

        this.anular$ = combineLatest([
            this.mapaCamasService.selectedPrestacion,
            this.registraEgreso$,
            this.mapaCamasService.view,
            this.mapaCamasService.loading
        ]).pipe(
            auditTime(1),
            map(([prestacion, registraEgreso, vista, loading]) => {
                this.activateOption(this.items[0].key);
                return prestacion?.estadoActual?.tipo !== 'validada' && vista === 'listado-internacion' && !loading;
            })
        );
    }

    onAnularInternacion() {
        this.deshacerInternacion(true);
    }

    onActiveOption(opcion) {
        this.mapaCamasService.resetView();
        this.mostrar = opcion;
    }

    activateOption(opcion) {
        this.mostrar = opcion;
        this.plexOptions.activate(opcion);
    }

    changeCama() {
        this.cambiarCama.emit();
    }

    onAccion($event) {
        if ($event) {
            this.accion.emit($event);
        } else {
            this.mostrar = this.items[0].key;
        }
    }

    toggleEdit() {
        if (this.mostrar === 'egreso') {
            this.editarEgreso = !this.editarEgreso;
            this.editarEgreso ? this.accion.emit({ accion: 'editando' }) : this.accion.emit(null);
        } else {
            this.editarIngresoIdInternacion = this.editarIngresoIdInternacion ? null : this.ingresoPacienteService.selectedPaciente.getValue();
            this.editarIngresoIdInternacion ? this.accion.emit({ accion: 'editando' }) : this.accion.emit(null);
        }
    }

    // Notifica unicamente un nuevo egreso
    notificarEgreso() {
        this.accion.emit({ accion: 'nuevo-egreso' });
    }

    deshacerInternacion(completo: boolean) {
        // deshacer desde listado de internacion
        const msjDeshacer = (completo) ? 'Si el paciente tiene prestaciones  se deberá <b>romper validación</b> de las mismas antes de intentar realizar esta acción. <br> <br> <b> ¿Está seguro que desea anular la internación?</b> ' : 'Esta acción deshace el último movimiento.   <br>    <b>¡Esta acción no se puede revertir!</b>';
        const msjTitulo = (completo) ? 'internación' : 'movimiento';
        this.plex.confirm(msjDeshacer, 'Anular ' + msjTitulo).then(resultado => {
            if (resultado) {
                combineLatest([
                    this.mapaCamasService.selectedPrestacion,
                    this.mapaCamasService.selectedResumen
                ]).pipe(
                    take(1),
                    switchMap(([prestacion, resumen]) => {
                        const idInternacion = resumen?._id ? resumen._id : prestacion.id;
                        return this.mapaCamasHTTP.deshacerInternacion(this.mapaCamasService.ambito, this.mapaCamasService.capa, idInternacion, completo).pipe(
                            switchMap(() => {
                                // hasta acá borramos movimiento(s) y resumen pero no anulamos la prestación
                                if (this.capa === 'medica') {
                                    return of(null);
                                }
                                // en el caso del resumen, si existe prestacion, esta viene populada en idPrestacion
                                const idPrestacion = (resumen?.idPrestacion as any)?.id || prestacion?.id;
                                const prestacionAux = {
                                    id: idPrestacion,
                                    solicitud: { turno: null }
                                };
                                return this.prestacionesService.invalidarPrestacion(prestacionAux);
                            })
                        );
                    })
                ).subscribe(() => {
                    this.plex.info('success', 'Se deshizo la internación', 'Éxito');
                    this.mapaCamasService.selectPrestacion(null);
                    this.mapaCamasService.selectResumen(null);
                    this.listadoInternacionCapasService.refresh.next(true);
                    this.listadoInternacion.refresh.next(true);
                });
            }
        });
    }

    puedeEgresar() {
        let condicion = true;
        if (this.capa === 'estadistica') {
            condicion = this.existeIngreso;
        }
        return this.permisosMapaCamasService.egreso && this.estadoPrestacion !== 'validada' && condicion;
    }

    puedeEditarEgreso() {
        let condicion = true;
        if (this.capa === 'medica') {
            condicion = this.mapaCamasService.view.getValue() === 'listado-internacion';
        }
        return this.permisosMapaCamasService.egreso && this.estadoPrestacion !== 'validada' && condicion;
    }
}
