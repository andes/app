import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { PlexOptionsComponent } from '@andes/plex';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';
import { Observable, Subscription, combineLatest } from 'rxjs';
import { MapaCamasService } from '../services/mapa-camas.service';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit {
    prestacion$: Observable<IPrestacion>;
    selectedPrestacion$: Observable<IPrestacion>;
    view$: Observable<string>;

    @Output() cambiarCama = new EventEmitter<any>();
    @ViewChild(PlexOptionsComponent, { static: false }) plexOptions: PlexOptionsComponent;

    public editar = false;
    public mostrar;
    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'egreso', label: 'EGRESO' }
    ];

    constructor(
        private mapaCamasService: MapaCamasService
    ) { }

    ngOnInit() {
        this.mostrar = 'ingreso';
        this.prestacion$ = this.mapaCamasService.prestacion$;
        this.selectedPrestacion$ = this.mapaCamasService.selectedPrestacion;
        this.view$ = this.mapaCamasService.view;
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
