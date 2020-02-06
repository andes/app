import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Auth } from '@andes/auth';

@Component({
    selector: 'app-informe-egreso',
    templateUrl: './informe-egreso.component.html',
})

export class InformeEgresoComponent implements OnInit {
    // EVENTOS
    @Input() fecha: Date;
    @Input() cama;
    @Input() camas;
    @Input() prestacion;
    @Input() detalle = false;
    @Input() edit = false;

    @Output() cancel = new EventEmitter<any>();
    @Output() toggleEditar = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();
    @Output() cambiarFecha = new EventEmitter<any>();

    // VARIABLES
    public capa: string;
    public informeEgreso;
    public fechaValida;
    public mensajeError;
    public prestacionValidada = false;

    constructor(
        public auth: Auth,
    ) { }

    ngOnInit() {
        if (this.prestacion) {
            this.prestacionValidada = (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada');
            if (this.prestacion.ejecucion.registros[1]) {
                this.informeEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso;
                this.fecha = this.informeEgreso.fechaEgreso;
            } else {
                this.fecha = moment().toDate();
            }
        }
    }

    // tslint:disable-next-line:use-lifecycle-interface
    ngOnChanges(changes: SimpleChanges) {
        if (changes && this.prestacion) {
            if (this.prestacion._id !== changes['prestacion']) {
                if (this.prestacion) {
                    this.prestacionValidada = (this.prestacion.estados[this.prestacion.estados.length - 1].tipo === 'validada');
                    if (this.prestacion.ejecucion.registros[1]) {
                        this.informeEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso;
                        this.fecha = this.informeEgreso.fechaEgreso;
                    } else {
                        this.fecha = moment().toDate();
                    }
                }
            }
        }

    }

    onEdit() {
        this.toggleEditar.emit(true);
        this.detalle = false;
        this.edit = true;
    }

    cancelar() {
        this.cancel.emit();
    }

    refescar(accion) {
        this.refresh.emit(accion);
        this.cancelar();
    }
}
