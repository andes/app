import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
    @Input() btnClose = false;
    @Input() edit = false;

    @Output() cancel = new EventEmitter<any>();
    @Output() close = new EventEmitter<any>();
    @Output() toggleEditar = new EventEmitter<any>();
    @Output() refresh = new EventEmitter<any>();

    // VARIABLES
    public capa: string;
    public informeEgreso;

    constructor(
        public auth: Auth,

    ) { }

    ngOnInit() {
        if (this.prestacion) {
            this.informeEgreso = this.prestacion.ejecucion.registros[1].valor.InformeEgreso;
        }
    }

    onClose() {
        this.close.emit();
    }

    onEdit() {
        this.toggleEditar.emit(true);
        this.detalle = false;
        this.edit = true;
    }

    cancelar() {
        if (!this.edit || !this.informeEgreso) {
            this.cancel.emit();
        } else {
            this.edit = false;
            this.toggleEditar.emit(false);
            this.detalle = true;
        }
    }
}
