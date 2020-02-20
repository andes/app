import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../services/mapa-camas.service';
import { Plex, PlexOptionsComponent } from '@andes/plex';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';
import { IPrestacion } from '../../../../modules/rup/interfaces/prestacion.interface';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit {
    // EVENTOS
    @Input() fecha: Date;
    @Input() prestacion: IPrestacion;

    @Output() toggleEditar = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();
    @Output() cambioCama = new EventEmitter<any>();

    @ViewChild(PlexOptionsComponent, { static: false }) plexOptions: PlexOptionsComponent;

    public paciente;

    public mostrar;

    public items = [
        { key: 'ingreso', label: 'INGRESO' },
        { key: 'movimientos', label: 'MOVIMIENTOS' },
        { key: 'egreso', label: 'EGRESO' }
    ];


    public editar = false;


    constructor(
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {
        this.mostrar = 'ingreso';
    }

    onActiveOption(opcion) {
        this.mostrar = opcion;
    }

    activatedOption(opcion) {
        this.mostrar = opcion;
        this.plexOptions.activate(opcion);
    }

    editarFormulario(editar: boolean) {
        this.editar = editar;
        this.toggleEditar.emit(editar);
    }

    refrescar(accion) {
        this.refresh.emit(accion);
    }

    cambiarCama() {
        this.cambioCama.emit();
    }
}
