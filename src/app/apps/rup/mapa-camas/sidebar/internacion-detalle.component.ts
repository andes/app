import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-internacion-detalle',
    templateUrl: './internacion-detalle.component.html',
})

export class InternacionDetalleComponent implements OnInit {
    // EVENTOS
    @Input() capa: string;
    @Input() fecha: Date;
    @Input() cama: any;
    @Input() camas: any;
    @Input() estados: any;
    @Input() relaciones: any;

    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public fechaIngreso;
    public paciente;
    public estadoCama;
    public prestacion;
    public informeIngreso;
    public relacionesPosibles;
    public habilitarIngreso = false;
    public habilitarEgreso = false;
    public mostrar;

    constructor(
        public auth: Auth,
    ) { }

    ngOnInit() {
        this.estadoCama = this.estados.filter(est => this.cama.estado === est.key)[0];
        this.getRelacionesPosibles();
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.estadoCama) {
            if (this.cama.idCama !== changes['cama']) {
                this.mostrar = null;
                this.habilitarIngreso = false;
                this.habilitarEgreso = false;
                this.getRelacionesPosibles();
            }
        }

    }

    getRelacionesPosibles() {
        this.relacionesPosibles = [];
        this.estados.map(est =>
            this.relaciones.map(rel => {
                if (this.estadoCama.key === rel.origen) {
                    if (est.key === rel.destino && rel.destino !== 'inactiva') {
                        this.relacionesPosibles.push(rel);
                    }
                }

                if (rel.accion === 'ingresarPaciente') {
                    this.habilitarIngreso = true;
                }

                if (rel.accion === 'desocuparCama') {
                    this.habilitarEgreso = true;
                }
            })
        );

        if (this.cama.paciente) {
            this.paciente = this.cama.paciente;
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
