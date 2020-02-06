import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter, ViewChild } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../mapa-camas.service';
import { Plex, PlexOptionsComponent } from '@andes/plex';
import { PrestacionesService } from '../../../../modules/rup/services/prestaciones.service';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit {
    // EVENTOS
    @Input() fecha: Date;
    @Input() prestacion: any;
    @Input() relacionesPosibles: any;

    @Output() toggleEditar = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();
    @Output() cambioCama = new EventEmitter<any>();

    @ViewChild(PlexOptionsComponent, { static: false }) plexOptions: PlexOptionsComponent;

    // VARIABLES
    public capa: string;
    public paciente;
    public mostrar;
    public items;
    public active;
    public habilitarIngreso;
    public habilitarEgreso;
    public detalleEgreso = false;
    public editar = false;


    constructor(
        public auth: Auth,
        private plex: Plex,
        private prestacionesService: PrestacionesService,
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;
        this.verificarOpciones();
        this.mostrar = 'ingreso';
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.prestacion) {
            if (this.prestacion._id !== changes['prestacion']) {
                this.mostrar = 'ingreso';
                this.habilitarIngreso = false;
                this.habilitarEgreso = false;
                this.verificarOpciones();
            }
        }

    }

    verificarOpciones() {
        if (this.relacionesPosibles) {
            this.relacionesPosibles.map(rel => {
                if (rel.accion === 'ingresarPaciente') {
                    this.habilitarIngreso = true;
                }

                if (rel.accion === 'desocuparCama') {
                    this.habilitarEgreso = true;
                }
            });
        }

        if (this.prestacion.paciente) {
            this.paciente = this.prestacion.paciente;
            this.habilitarIngreso = true;
            this.habilitarEgreso = true;
        }

        this.habilitarOpciones();
    }

    habilitarOpciones() {
        this.items = [];

        if (this.habilitarIngreso) {
            this.items.push({ key: 'ingreso', label: 'INGRESO' });
        }

        this.items.push({ key: 'movimientos', label: 'MOVIMIENTOS' });

        if (this.habilitarEgreso) {
            this.items.push({ key: 'egreso', label: 'EGRESO' });
            if (this.prestacion.ejecucion.registros[1]) {
                this.detalleEgreso = true;
            }
        }
    }

    activatedOption(opcion) {
        if (opcion) {
            this.mostrar = opcion;
            this.plexOptions.activate(opcion);
            this.active = opcion;
        }
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
