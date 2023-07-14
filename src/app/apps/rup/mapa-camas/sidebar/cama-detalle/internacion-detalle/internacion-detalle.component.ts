import { Plex, PlexOptionsComponent } from '@andes/plex';
import { Component, ContentChild, EventEmitter, OnDestroy, OnInit, Output, AfterViewChecked, ChangeDetectorRef, Input } from '@angular/core';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { auditTime, map, switchMap, take } from 'rxjs/operators';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { MapaCamasHTTP } from '../../../services/mapa-camas.http';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionCapasService } from '../../../views/listado-internacion-capas/listado-internacion-capas.service';
import { ListadoInternacionService } from '../../../views/listado-internacion/listado-internacion.service';
@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, OnDestroy, AfterViewChecked {
    puedeDesocupar$: Observable<any>;
    resumenInternacion$: Observable<any>;
    public estadoPrestacion;
    public existeIngreso;
    public editar;
    view$ = this.mapaCamasService.view;

    @Output() cambiarCama = new EventEmitter<any>();
    @Output() accion = new EventEmitter<any>();
    @ContentChild(PlexOptionsComponent, { static: true }) plexOptions: PlexOptionsComponent;

    public mostrar;
    public hayMovimientosAt$: Observable<Boolean>;
    public hayMovimientosSinEgresoAt$: Observable<Boolean>;
    public anular$: Observable<Boolean>;
    public capa;

    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'egreso', label: 'EGRESO' }
    ];

    private subscription: Subscription;

    constructor(
        public mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private mapaCamasHTTP: MapaCamasHTTP,
        private plex: Plex,
        private prestacionesService: PrestacionesService,
        private listadoInternacionCapasService: ListadoInternacionCapasService,
        private listadoInternacion: ListadoInternacionService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngAfterViewChecked() {
        this.cdr.detectChanges();
    }

    ngOnInit() {
        this.mostrar = 'ingreso';
        this.editar = false;
        this.mapaCamasService.prestacion$.subscribe(prestacion => {
            this.estadoPrestacion = '';
            this.existeIngreso = false;
            if (prestacion) {
                this.editar = false;
                this.estadoPrestacion = prestacion.estadoActual.tipo;
                if (prestacion.ejecucion.registros[prestacion.ejecucion.registros.length - 1].valor.informeIngreso) {
                    this.existeIngreso = true;
                }
                this.mapaCamasService.load(false);
            }
        });
        this.subscription = this.mapaCamasService.resumenInternacion$.subscribe(resumen => {
            this.editar = false;
            this.capa = this.mapaCamasService.capa;
            if (this.capa !== 'estadistica' && this.capa !== 'estadistica-v2') {
                if (resumen?.ingreso) {
                    this.items = [
                        { key: 'ingreso-dinamico', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                    this.mostrar = 'ingreso-dinamico';
                } else {
                    // medico / enfermero
                    this.items = [
                        { key: 'ingreso', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                }
            } else {
                //  estadistica / estadistica-v2
                this.items = [
                    { key: 'ingreso', label: 'INGRESO' },
                    { key: 'movimientos', label: 'MOVIMIENTOS' },
                    { key: 'registros', label: 'REGISTROS' },
                    { key: 'egreso', label: 'EGRESO' }
                ];
            }
            const registro = this.items.findIndex(item => item.key === 'registros');
            if (registro !== -1 && !this.permisosMapaCamasService.registros) {
                this.items.splice(registro, 1);
            }
        });

        this.hayMovimientosAt$ = this.mapaCamasService.historialInternacion$.pipe(
            map(historial => {
                const tieneIDMov = historial.every(
                    mov => mov.extras?.ingreso || mov.extras?.idMovimiento || mov.extras?.egreso
                );
                return historial.length > 0 && tieneIDMov;
            })
        );

        this.hayMovimientosSinEgresoAt$ = this.mapaCamasService.historialInternacion$.pipe(
            map((historial) => {
                const egresoOSala = historial.some(mov => mov.extras?.egreso || mov.idSalaComun);
                const tieneIDMov = historial.every(
                    mov => mov.extras?.ingreso || mov.extras?.idMovimiento
                );
                return historial.length > 0 && tieneIDMov && !egresoOSala;
            })
        );

        this.anular$ = combineLatest([
            this.mapaCamasService.selectedPrestacion,
            this.hayMovimientosAt$,
            this.mapaCamasService.view
        ]).pipe(
            auditTime(1),
            map(([prestacion, movimientos, vista]) => {
                return prestacion?.estadoActual?.tipo !== 'validada' && movimientos && vista === 'listado-internacion';
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
        this.editar = !this.editar;
        this.editar ? this.accion.emit({ accion: 'editando' }) : this.accion.emit(null);
    }

    // Notifica unicamente un nuevo egreso
    notificarEgreso() {
        this.accion.emit({ accion: 'nuevo-egreso' });
    }

    deshacerInternacion(completo: boolean) {
        // deshacer desde listado de internacion
        this.plex.confirm('Esta acción deshace una internación, es decir, ya no figurará en el listado. ¡Esta acción no se puede revertir!', '¿Quiere deshacer esta internación?').then((resultado) => {
            if (resultado) {
                combineLatest([
                    this.mapaCamasService.selectedPrestacion,
                    this.mapaCamasService.selectedResumen
                ]).pipe(
                    take(1),
                    switchMap(([prestacion, resumen]) => {
                        const idInternacion = resumen?.id ? resumen.id : prestacion.id;
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
                    this.plex.info('success', 'Se deshizo la internación', 'Éxito');;
                    this.mapaCamasService.selectPrestacion(null);
                    this.mapaCamasService.selectResumen(null);
                    this.listadoInternacionCapasService.refresh.next(true);
                    this.listadoInternacion.refresh.next(true);
                });
            }
        });
    }

    puedeEgresar() {
        return (this.permisosMapaCamasService.egreso && this.estadoPrestacion !== 'validada' && (this.editar || this.existeIngreso)) ? true : false;
    }

    puedeEditar() {
        return (this.permisosMapaCamasService.egreso && this.estadoPrestacion !== 'validada') ? true : false;
    }
}
