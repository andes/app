import { Plex, PlexOptionsComponent } from '@andes/plex';
import { Component, ContentChild, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { auditTime, first, map, tap } from 'rxjs/operators';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { MapaCamasHTTP } from '../../../services/mapa-camas.http';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { ListadoInternacionService } from '../../../views/listado-internacion/listado-internacion.service';
@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, OnDestroy {
    puedeDesocupar$: Observable<any>;
    resumenInternacion$: Observable<any>;

    public prestacion$: Observable<IPrestacion>;

    view$ = this.mapaCamasService.view;

    @Output() cambiarCama = new EventEmitter<any>();
    @Output() accion = new EventEmitter<any>();

    @ContentChild(PlexOptionsComponent, { static: true }) plexOptions: PlexOptionsComponent;

    public editar = false;
    public existeEgreso = false;
    public mostrar;
    public hayMovimientosAt$: Observable<Boolean>;
    public anular$: Observable<Boolean>;
    public capa;

    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'egreso', label: 'EGRESO' }
    ];

    private subscription: Subscription;

    constructor(
        private mapaCamasService: MapaCamasService,
        public permisosMapaCamasService: PermisosMapaCamasService,
        private mapaCamasHTTP: MapaCamasHTTP,
        private plex: Plex,
        private prestacionesService: PrestacionesService,
        private listadoInternacionService: ListadoInternacionService
    ) { }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    ngOnInit() {
        this.mostrar = 'ingreso';

        this.prestacion$ = this.mapaCamasService.prestacion$.pipe(
            tap(() => this.editar = false)
        );

        this.subscription = combineLatest(
            this.mapaCamasService.capa2,
            this.mapaCamasService.resumenInternacion$
        ).subscribe(([capa, resumen]) => {
            this.capa = capa;
            if (capa !== 'estadistica' && capa !== 'carga') {
                if (resumen.ingreso) {
                    this.items = [
                        { key: 'ingreso-dinamico', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                    this.mostrar = 'ingreso-dinamico';
                } else {
                    this.items = [
                        { key: 'ingreso', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                    this.mostrar = 'movimientos';
                }
            } else {
                if (capa === 'estadistica') {
                    this.items = [
                        { key: 'ingreso', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' },
                        { key: 'egreso', label: 'EGRESO' }
                    ];
                } else {
                    this.items = [
                        { key: 'ingreso', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                }
            }

            const registro = this.items.findIndex(item => item.key === 'registros');
            if (registro !== -1 && !this.permisosMapaCamasService.registros) {
                this.items.splice(registro, 1);
            }
        });

        this.resumenInternacion$ = this.mapaCamasService.resumenInternacion$;
        this.mapaCamasService.selectedPrestacion.subscribe(prestacion => {
            this.existeEgreso = prestacion?.ejecucion?.registros?.length > 1;
            if (this.editar) {
                this.editar = false;
                this.accion.emit(null);
            }
        });

        this.hayMovimientosAt$ = this.mapaCamasService.historialInternacion$.pipe(
            map((historial) => {
                const tieneIDMov = historial.every(
                    mov => mov.extras?.ingreso || mov.extras?.idMovimiento || mov.extras?.egreso
                );
                return historial.length > 0 && tieneIDMov;
            })
        );

        this.anular$ = combineLatest([
            this.prestacion$,
            this.hayMovimientosAt$,
            this.mapaCamasService.view
        ]).pipe(
            auditTime(1),
            map(([prestacion, movimientos, vista]) => {
                return prestacion?.estadoActual.tipo !== 'validada' && movimientos && vista === 'listado-internacion';
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

    activatedOption(opcion) {
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


    deshacerInternacion(completo: boolean) {
        this.prestacion$.pipe(first()).subscribe(prestacion => {
            this.plex.confirm('Esta acción deshace una internación, es decir, ya no figurará en el listado. ¡Esta acción no se puede revertir!', '¿Quiere deshacer esta internación?').then((resultado) => {
                if (resultado) {
                    this.mapaCamasHTTP.deshacerInternacion(this.mapaCamasService.ambito, this.mapaCamasService.capa, prestacion.id, completo).subscribe((response) => {
                        if (response.status && this.mapaCamasService.capa === 'estadistica') {
                            const prestacionAux = { id: prestacion.id, solicitud: { turno: null } };
                            this.prestacionesService.invalidarPrestacion(prestacionAux).subscribe();
                        }
                        this.plex.info('success', 'Se deshizo la internacion', 'Éxito');
                        this.mapaCamasService.selectPrestacion(null);
                        this.listadoInternacionService.refresh.next(true);
                    });
                }
            });
        });
    }
}
