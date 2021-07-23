import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy, ContentChild, AfterContentInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { PlexOptionsComponent } from '@andes/plex';
import { IPrestacion } from '../../../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MapaCamasService } from '../../../services/mapa-camas.service';
import { Auth } from '@andes/auth';
import { PermisosMapaCamasService } from '../../../services/permisos-mapa-camas.service';
import { map, tap, first } from 'rxjs/operators';
import { Plex } from '@andes/plex';
import { MapaCamasHTTP } from '../../../services/mapa-camas.http';
import { PrestacionesService } from 'src/app/modules/rup/services/prestaciones.service';
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
    itemsDeshacer = [
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
        private prestacionesService: PrestacionesService
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
            if (capa !== 'estadistica') {
                if (resumen.ingreso) {
                    this.items = [
                        { key: 'ingreso-dinamico', label: 'INGRESO' },
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                    this.mostrar = 'ingreso-dinamico';
                } else {
                    this.items = [
                        { key: 'movimientos', label: 'MOVIMIENTOS' },
                        { key: 'registros', label: 'REGISTROS' }
                    ];
                    this.mostrar = 'movimientos';
                }
            } else {
                this.items = [
                    { key: 'ingreso', label: 'INGRESO' },
                    { key: 'movimientos', label: 'MOVIMIENTOS' },
                    { key: 'registros', label: 'REGISTROS' },
                    { key: 'egreso', label: 'EGRESO' }
                ];
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
                const egreso = historial.some(mov => mov.extras?.egreso);
                const tieneIDMov = historial.every(
                    mov => mov.extras?.ingreso || mov.extras?.idMovimiento
                );
                return historial.length > 0 && tieneIDMov && !egreso;
            })
        );
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
                    this.mapaCamasHTTP.deshacerInternacion(this.mapaCamasService.ambito, this.mapaCamasService.capa, prestacion.id, completo)
                        .subscribe((response) => {
                            if (response.status && this.mapaCamasService.capa === 'estadistica') {
                                const prestacionAux = { id: prestacion.id, solicitud: { turno: null } };
                                this.prestacionesService.invalidarPrestacion(prestacionAux).subscribe();
                            }
                            this.plex.info('success', 'Se deshizo la internacion', 'Éxito');
                            this.mapaCamasService.selectPrestacion(null);
                            this.mapaCamasService.setFecha(this.mapaCamasService.fecha);

                        });
                }
            });
        });
    }
}
