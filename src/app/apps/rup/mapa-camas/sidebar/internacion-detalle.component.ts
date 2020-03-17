import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PlexOptionsComponent } from '@andes/plex';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MapaCamasService } from '../services/mapa-camas.service';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, OnDestroy {
    puedeDesocupar$: Observable<any>;
    prestacion: IPrestacion;
    view: string;

    @Output() cambiarCama = new EventEmitter<any>();
    @ViewChild(PlexOptionsComponent, { static: false }) plexOptions: PlexOptionsComponent;

    public editar = false;
    public existeEgreso = false;
    public prestacionValidada = false;
    public mostrar;
    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'egreso', label: 'EGRESO' }
    ];

    private subscription: Subscription;

    constructor(
        private mapaCamasService: MapaCamasService,
        private prestacionService: PrestacionesService
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.mostrar = 'ingreso';
        this.subscription = combineLatest(
            this.mapaCamasService.view,
            this.mapaCamasService.selectedCama,
            this.mapaCamasService.prestacion$,
        ).subscribe(([view, cama, prestacion]) => {
            this.view = view;

            if (view === 'listado-internacion') {
                if (prestacion) {
                    this.prestacion = prestacion;
                    if (prestacion.estados[prestacion.estados.length - 1].tipo === 'validada') {
                        this.editar = false;
                        this.prestacionValidada = true;
                    } else {
                        this.prestacionValidada = false;
                    }

                    if (prestacion.ejecucion.registros[1] && prestacion.ejecucion.registros[1].valor && prestacion.ejecucion.registros[1].valor.InformeEgreso) {
                        this.existeEgreso = true;
                    } else {
                        this.existeEgreso = false;
                    }

                    if (!this.mostrar) {
                        this.activatedOption('ingreso');
                    }
                } else {
                    this.editar = false;
                    this.mostrar = null;
                }
            } else if (view === 'mapa-camas') {
                if (cama.estado === 'ocupada') {
                    this.prestacionService.getById(cama.idInternacion).subscribe(p => {
                        if (p.ejecucion.registros[1]) {
                            if (!p.ejecucion.registros[1].valor.InformeEgreso) {
                                this.puedeDesocupar$ = this.mapaCamasService.verificarCamaDesocupar(cama, p);
                            }
                        }
                    });
                }
            }
        });
    }

    onActiveOption(opcion) {
        this.mostrar = opcion;
    }

    activatedOption(opcion) {
        this.mostrar = opcion;
        this.plexOptions.activate(opcion);
    }

    changeCama() {
        this.cambiarCama.emit();
    }

    toggleEdit() {
        this.editar = !this.editar;
    }
}
