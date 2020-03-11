import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PlexOptionsComponent } from '@andes/plex';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MapaCamasService } from '../services/mapa-camas.service';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit, OnDestroy {
    prestacion: IPrestacion;
    selectedPrestacion: IPrestacion;
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
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.mostrar = 'ingreso';
        this.subscription = combineLatest(
            this.mapaCamasService.view,
            this.mapaCamasService.prestacion$,
            this.mapaCamasService.selectedPrestacion
        ).subscribe(([view, prestacion, selectedPrestacion]) => {
            this.view = view;
            this.prestacion = prestacion;
            this.selectedPrestacion = selectedPrestacion;

            if (selectedPrestacion.id) {
                if (selectedPrestacion.estados[selectedPrestacion.estados.length - 1].tipo === 'validada') {
                    this.editar = false;
                    this.prestacionValidada = true;
                } else {
                    this.prestacionValidada = false;
                }

                if (selectedPrestacion.ejecucion.registros[1] && selectedPrestacion.ejecucion.registros[1].valor && selectedPrestacion.ejecucion.registros[1].valor.InformeEgreso) {
                    this.existeEgreso = true;
                } else {
                    this.existeEgreso = false;
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
