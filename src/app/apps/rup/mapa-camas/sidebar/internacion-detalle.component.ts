import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';
import { MapaCamasService } from '../mapa-camas.service';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit {
    // EVENTOS
    @Input() fecha: Date;
    @Input() prestacion: any;
    @Input() relacionesPosibles: any;

    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public capa: string;
    public paciente;
    public habilitarIngreso = false;
    public habilitarEgreso = false;
    public mostrar;

    constructor(
        public auth: Auth,
        private mapaCamasService: MapaCamasService,
    ) {
    }

    ngOnInit() {
        this.capa = this.mapaCamasService.capa;
        this.habilitarOpciones();
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.prestacion) {
            if (this.prestacion._id !== changes['prestacion']) {
                this.mostrar = null;
                this.habilitarIngreso = false;
                this.habilitarEgreso = false;
                this.habilitarOpciones();
            }
        }

    }

    habilitarOpciones() {
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
        }
    }

    toggleMostrar(componente) {
        this.mostrar = componente;
    }

    refrescar(accion) {
        this.refresh.emit(accion);
    }
}
